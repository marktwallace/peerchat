// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/jwt';
import { RequestWithPublicKey, JwtPayload } from '../models';

export function authMiddleware(req: RequestWithPublicKey, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header provided' });
    return;
  }

  const token = authHeader.split(' ')[1]; // expecting 'Bearer sessionToken'

  if (!token) {
    res.status(401).json({ error: 'Invalid authorization header format' });
    return;
  }

  try {
    const payload : JwtPayload | null = verifyJWT(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired session token' });
      return;
    }

    // Attach the publicKey to the request object for use in handlers
    req.publicKey = payload.sub;

    next();
  } catch (error) {
    if (error instanceof Error) {
      console.error('JWT verification error:', error.message);
    } else {
      console.error('JWT verification error:', error);
    }
    res.status(401).json({ error: 'Invalid or expired session token' });
    return;
  }
};
