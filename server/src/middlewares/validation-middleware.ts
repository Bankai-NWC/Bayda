import type { NextFunction, Request, Response } from 'express';
import { ZodError, ZodObject } from 'zod';

import { ApiError } from './error-middleware.js';

export function validateData(schema: ZodObject<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validateData = schema.parse(req.body);
      req.body = validateData;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessages = err.issues.map((err) => `${err.message}`);
        return next(ApiError.BadRequest('Validation error', errorMessages));
      }
      next(err);
    }
  };
}
