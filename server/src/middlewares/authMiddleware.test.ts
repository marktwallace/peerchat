// src/middlewares/authMiddleware.test.ts
import request from 'supertest';
import express, { Request, Response } from 'express';
import { authMiddleware } from './authMiddleware';
import { createJWT } from '../utils/jwt';
import { JwtPayload } from '../models';

const app = express();

// Mock endpoint that uses the authMiddleware
app.get('/protected', authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Access granted' });
});

// JWT payload for testing
const payload: JwtPayload = {
  sub: '1234567890',
  exp: Math.floor(Date.now() / 1000) + 60, // valid for 60 seconds
  iat: Math.floor(Date.now() / 1000),
};

// JWT headers
const header = { alg: 'EdDSA', typ: 'JWT' };

// Create a valid JWT
const validJWT = createJWT(header, payload);

describe('authMiddleware', () => {
  it('should return 401 if no authorization header is provided', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No authorization header provided');
  });

  it('should return 401 if authorization header format is incorrect', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'InvalidFormatToken');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid authorization header format');
  });

  it('should return 401 if token is invalid', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidToken');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid or expired session token');
  });

  it('should return 401 if token is expired', async () => {
    const expiredPayload: JwtPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) - 10, // expired 10 seconds ago
    };
    const expiredJWT = createJWT(header, expiredPayload);

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${expiredJWT}`);
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid or expired session token');
  });

  it('should proceed to next middleware if token is valid', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validJWT}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
  });
});
