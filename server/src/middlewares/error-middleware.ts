import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  status: number;
  errors: any;

  constructor(status: number, message: string, errors: any = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError(): ApiError {
    return new ApiError(401, 'User is not authorized');
  }

  static BadRequest(message: string, errors: any = []): ApiError {
    return new ApiError(400, message, errors);
  }

  static NotFound(message: string): ApiError {
    return new ApiError(404, message);
  }

  static Internal(message: string, errors: any = []): ApiError {
    return new ApiError(500, message, errors);
  }

  static Forbidden(message: string, errors: any = []): ApiError {
    return new ApiError(403, message, errors);
  }
}

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.log(err);
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: 'Validation Error in Database',
      errors: err.message,
    });
  }

  return res.status(500).json({ message: 'Unexpected error' });
}
