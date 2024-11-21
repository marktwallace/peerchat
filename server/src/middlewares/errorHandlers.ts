// Handle 404 errors
import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
      error: 'Not Found',
      message: `Cannot find ${req.originalUrl}`,
  });
};

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack); // Log the error stack for debugging
  res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
  });
};
