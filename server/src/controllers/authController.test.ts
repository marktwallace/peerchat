// src/controllers/authController.test.ts
import request from 'supertest';
import express from 'express';
import nacl from 'tweetnacl';
import { login, confirmLogin } from './authController';
import { createJWT } from '../utils/jwt';
import messageService from '../services/messageService';

jest.mock('../services/messageService');
jest.mock('../utils/jwt');

const app = express();
app.use(express.json());
app.post('/api/login', login);
app.post('/api/confirm-login', confirmLogin);

describe('authController', () => {
  let publicKeyBase64: string;
  let privateKeyUint8: Uint8Array;
  let nonceBase64: string;

  beforeAll(() => {
    // Generate key pair for testing
    const keyPair = nacl.sign.keyPair();
    privateKeyUint8 = keyPair.secretKey;
    publicKeyBase64 = Buffer.from(keyPair.publicKey).toString('base64');
  });

  describe('POST /api/login', () => {
    it('should return 400 if public key is not provided', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Public key is required');
    });

    it('should return 400 if public key length is invalid', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ publicKey: 'invalidPublicKey' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid public key length');
    });

    it('should return 200 and a nonce if public key is valid', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ publicKey: publicKeyBase64 });

      expect(response.status).toBe(200);
      expect(response.body.nonce).toBeDefined();
      nonceBase64 = response.body.nonce; // Store the nonce for confirmLogin tests
    });
  });

  describe('POST /api/confirm-login', () => {
    it('should return 400 if public key or signature is missing', async () => {
      const response = await request(app)
        .post('/api/confirm-login')
        .send({ publicKey: publicKeyBase64 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Public key and signature are required');
    });

    it('should return 400 if no login initiated for the public key', async () => {
      const response = await request(app)
        .post('/api/confirm-login')
        .send({ publicKey: 'anotherPublicKey', signature: 'fakeSignature' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No login initiated for this public key');
    });

    it('should return 400 if the nonce has expired', async () => {
      // Manually expire the nonce for testing
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 10 * 60 * 1000); // 10 minutes later

      const signatureUint8 = nacl.sign.detached(Uint8Array.from(Buffer.from(nonceBase64, 'base64')), privateKeyUint8);
      const signatureBase64 = Buffer.from(signatureUint8).toString('base64');

      const response = await request(app)
        .post('/api/confirm-login')
        .send({ publicKey: publicKeyBase64, signature: signatureBase64 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Nonce has expired');

      jest.spyOn(Date, 'now').mockRestore(); // Restore original Date.now()
    });

    it('should return 403 if the signature is invalid', async () => {
      const invalidSignatureBase64 = Buffer.from(nacl.randomBytes(64)).toString('base64');

      const response = await request(app)
        .post('/api/confirm-login')
        .send({ publicKey: publicKeyBase64, signature: invalidSignatureBase64 });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid signature');
    });

    it('should return 200 and a JWT if the signature is valid', async () => {
      const originalNow = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(originalNow);

      // Generate a valid signature for the nonce
      const nonceUint8 = Uint8Array.from(Buffer.from(nonceBase64, 'base64'));
      const signatureUint8 = nacl.sign.detached(nonceUint8, privateKeyUint8);
      const signatureBase64 = Buffer.from(signatureUint8).toString('base64');

      // Mock JWT generation
      const jwtMock = 'mocked.jwt.token';
      (createJWT as jest.Mock).mockReturnValue(jwtMock);

      const response = await request(app)
        .post('/api/confirm-login')
        .send({ publicKey: publicKeyBase64, signature: signatureBase64 });

      expect(response.status).toBe(200);
      expect(response.body.sessionToken).toBe(jwtMock);
      expect(messageService.broadcastMessage).toHaveBeenCalledWith(expect.objectContaining({
        type: 'user_login',
        publicKey: publicKeyBase64,
        friendlyName: 'UserFriendlyNameHere',
        privilege: 'standard',
      }));

      jest.spyOn(Date, 'now').mockRestore(); // Restore original Date.now()
    });
  });
});
