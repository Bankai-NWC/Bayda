import { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from './error-middleware.js';

export function roleMiddleware(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.UnauthorizedError());

    if (!roles.includes(req.user.role)) {
      return next(ApiError.Forbidden('Access denied'));
    }

    next();
  };
}
