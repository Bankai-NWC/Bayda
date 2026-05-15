import 'dotenv/config';

import jwt from 'jsonwebtoken';

import { prisma } from '../config/db.js';
import type { IResetPayload } from '../types/auth.js';

class TokenService {
  generateTokens(payload: object) {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '30m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
    };
  }

  generateResetToken(payload: IResetPayload) {
    const resetToken = jwt.sign(payload, process.env.RESET_TOKEN_SECRET!, { expiresIn: '15m' });

    return { resetToken };
  }

  validateResetToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.RESET_TOKEN_SECRET!);
      return userData;
    } catch {
      return null;
    }
  }

  validateAccessToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
      return userData;
    } catch {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
      return userData;
    } catch {
      return null;
    }
  }

  async saveToken(userId: number, refreshToken: string, userAgent: string) {
    const tokenData = await prisma.session.findFirst({
      where: { userId },
    });

    if (tokenData) {
      return prisma.session.update({
        where: { id: tokenData.id },
        data: {
          refreshToken,
          userAgent,
          expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const token = await prisma.session.create({
      data: {
        userId: userId,
        refreshToken: refreshToken,
        userAgent: userAgent,
        expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return token;
  }

  async removeToken(refreshToken: string) {
    const tokenData = await prisma.session.delete({
      where: {
        refreshToken: refreshToken,
      },
    });

    return tokenData;
  }

  async refresh(refreshToken: string) {
    const tokenData = await prisma.session.findUnique({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!tokenData) {
      throw new Error('Invalid refresh token');
    }

    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    } catch {
      await prisma.session.delete({
        where: {
          id: tokenData.id,
        },
      });

      throw new Error('Invalid refresh token');
    }

    if (tokenData.expiresAt < new Date()) {
      await prisma.session.delete({
        where: {
          id: tokenData.id,
        },
      });

      throw new Error('Refresh token expired');
    }

    const user = await prisma.user.findUnique({
      where: {
        id: tokenData.userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const tokens = this.generateTokens({ id: user.id, email: user.email });
    await prisma.session.update({
      where: {
        id: tokenData.id,
      },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async findToken(refreshToken: string) {
    const tokenData = await prisma.session.findUnique({
      where: {
        refreshToken: refreshToken,
      },
    });

    return tokenData;
  }
}

export default new TokenService();
