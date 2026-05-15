import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../middlewares/error-middleware.js';
import userService from '../services/user-service.js';

class UserController {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName, phone } = req.body;
      const userAgent = req.headers['user-agent'] || 'unknown';
      const userData = await userService.registration(email, password, fullName, phone, userAgent);
      const { refreshToken, accessToken, user } = userData;
      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      res.cookie('accessToken', accessToken, {
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      return res.json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'] || 'unknown';
      const sessionId = req.cookies['cart_session'];
      const userData = await userService.login(email, password, userAgent!, sessionId);
      const { refreshToken, accessToken, user } = userData;
      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      res.cookie('accessToken', accessToken, {
        maxAge: 30 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      return res.json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie('refreshToken', { path: '/' });
      res.clearCookie('accessToken', { path: '/' });
      return res.json(token);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const userAgent = req.headers['user-agent'] || 'unknown';
      const userData = await userService.refresh(refreshToken, userAgent);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      res.cookie('accessToken', userData.accessToken, {
        maxAge: 30 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const activationLink = String(req.params.link);
      const userAgent = req.headers['user-agent'] || 'unknown';
      const sessionId = req.cookies['cart_session'];
      const userData = await userService.activate(activationLink, userAgent, sessionId);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      res.cookie('accessToken', userData.accessToken, {
        maxAge: 30 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      return res.json({ user: userData.user });
    } catch (err) {
      next(err);
    }
  }

  async resendActivation(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) return next(ApiError.BadRequest('Email is required'));

      await userService.resendActivation(email);
      return res.json({ message: 'Activation link sent' });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await userService.forgotPassword(email);

      res.cookie('resetEmail', email, {
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });

      return res.json({ message: 'Code sent to your email' });
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { otp } = req.body;
      const email = req.cookies.resetEmail;

      if (!email) {
        throw ApiError.BadRequest('Reset session expired. Please request a new code.');
      }

      const result = await userService.verifyOtp(email, otp.trim());
      res.clearCookie('resetEmail');
      res.cookie('resetToken', result.resetToken, {
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });

      return res.json('Verify OTP code successful');
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { newPassword } = req.body;
      const resetToken = req.cookies.resetToken;
      const result = await userService.resetPassword(resetToken, newPassword);

      res.clearCookie('resetToken');
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;

      if (!user || !user.id) {
        return next(ApiError.UnauthorizedError());
      }

      const userData = await userService.getProfile(user.id);
      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
