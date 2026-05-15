import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { prisma } from '../config/db.js';
import { UserDto } from '../dtos/user-dto.js';
import { ApiError } from '../middlewares/error-middleware.js';
import type { IAuthResponse, IResetPayload, ITokenPayload } from '../types/auth.js';
import cartService from './cart-service.js';
import mailService from './mail-service.js';
import tokenService from './token-service.js';

class UserService {
  async registration(
    email: string,
    password: string,
    fullName: string,
    phone: string,
    userAgent: string,
  ): Promise<IAuthResponse> {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const activateLink = uuidv4();

      const user = await prisma.user.create({
        data: {
          email: email,
          passwordHash: passwordHash,
          fullName: fullName,
          phone: phone,
          activationLink: activateLink,
        },
      });

      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, tokens.refreshToken, userAgent);
      await mailService.sendActivateMailLink(
        email,
        `${process.env.CLIENT_URL}/auth/activate/${activateLink}`,
        fullName,
      );

      return { user: userDto, ...tokens };
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw ApiError.BadRequest(`User with email ${email} already exists`);
      }

      throw err;
    }
  }

  async login(
    email: string,
    password: string,
    userAgent: string,
    sessionId?: string,
  ): Promise<IAuthResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw ApiError.BadRequest('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw ApiError.BadRequest('Invalid password');
      }

      if (sessionId) {
        await cartService.mergeCarts(sessionId, user.id);
      }

      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, tokens.refreshToken, userAgent);

      return { user: userDto, ...tokens };
    } catch (err) {
      throw err;
    }
  }

  async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken: string, userAgent: string): Promise<IAuthResponse> {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken) as ITokenPayload;
    const tokenFromDB = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDB) {
      throw ApiError.UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (!user) {
      throw ApiError.UnauthorizedError();
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken, userAgent);

    return { user: userDto, ...tokens };
  }

  async activate(activationLink: string, userAgent: string, sessionId?: string) {
    const user = await prisma.user.findUnique({
      where: {
        activationLink: activationLink,
      },
    });

    if (!user) {
      throw ApiError.BadRequest('Uncorrect activation link');
    }

    if (sessionId) {
      await cartService.mergeCarts(sessionId, user.id);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isActivated: true },
    });

    const userDto = new UserDto(updatedUser);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken, userAgent);

    return { user: userDto, ...tokens };
  }

  async resendActivation(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw ApiError.BadRequest('User not found');
    if (user.isActivated) throw ApiError.BadRequest('Account is already activated');

    const activateLink = uuidv4();

    await prisma.user.update({
      where: { id: user.id },
      data: { activationLink: activateLink },
    });

    await mailService.sendActivateMailLink(
      user.email,
      `${process.env.CLIENT_URL}/auth/activate/${activateLink}`,
      user.fullName,
    );
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordResetToken.upsert({
      where: {
        userId: user.id,
      },
      update: {
        userId: user.id,
        token: otp,
        expiresAt: expiryDate,
      },
      create: {
        userId: user.id,
        token: otp,
        expiresAt: expiryDate,
      },
    });

    await mailService.sendOtpCode(user.email, user.fullName, otp);
  }

  async verifyOtp(email: string, otp: string) {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw ApiError.BadRequest('User not found');
    }

    const otpData = await prisma.passwordResetToken.findUnique({
      where: {
        userId: user?.id,
      },
    });

    if (!otpData) {
      throw ApiError.BadRequest('Invalid or expired OTP code');
    }

    const isExpired = otpData.expiresAt.getTime() < Date.now();

    if (otpData.token !== otp || isExpired) {
      if (isExpired) {
        await prisma.passwordResetToken.delete({ where: { userId: user.id } });
      }
      throw ApiError.BadRequest('Invalid or expired OTP code');
    }

    await prisma.passwordResetToken.delete({ where: { userId: user.id } });

    return tokenService.generateResetToken({ id: user.id, purpose: 'password_reset' });
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const decoded = tokenService.validateResetToken(resetToken) as IResetPayload;

      if (decoded.purpose !== 'password_reset') {
        throw ApiError.BadRequest('Invalid token purpose');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: decoded.id },
        data: { passwordHash: passwordHash },
      });

      await prisma.session.deleteMany({ where: { userId: decoded.id } });

      return { message: 'Password changed successfully' };
    } catch {
      throw ApiError.BadRequest('Reset token is invalid or expired');
    }
  }

  async getProfile(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw ApiError.UnauthorizedError();
      }

      const userDto = new UserDto(user);

      return userDto;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw ApiError.BadRequest('Error retrieving profile');
    }
  }
}

export default new UserService();
