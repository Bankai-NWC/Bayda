import tokenService from '../services/token-service.js';
import { ApiError } from './error-middleware.js';

export function authMiddleware(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;

    console.log('Authorization header:', req.headers.authorization);
    if (!authHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = userData;
    next();
  } catch {
    return next(ApiError.UnauthorizedError());
  }
}
