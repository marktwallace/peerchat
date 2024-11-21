// src/controllers/inviteController.test.ts
import request from 'supertest';
import express from 'express';
import { createInvite, acceptInvite } from './inviteController';

const PRIVATE_KEY_BASE64 = process.env.PEERCHAT_PRIVATE_KEY;
const PUBLIC_KEY_BASE64 = process.env.PEERCHAT_PUBLIC_KEY;
const OWNER_TOKEN = process.env.PEERCHAT_OWNER_TOKEN;

if (!PRIVATE_KEY_BASE64 || !PUBLIC_KEY_BASE64 || !OWNER_TOKEN) {
  throw new Error('Environment variables PEERCHAT_PRIVATE_KEY, PEERCHAT_PUBLIC_KEY, and PEERCHAT_OWNER_TOKEN must be set');
}

const app = express();
app.use(express.json());
app.post('/api/create-invite', createInvite);
app.post('/api/accept-invite', acceptInvite);

describe('inviteController', () => {
  describe('POST /api/create-invite', () => {
    it('should return 403 if the authorization token is incorrect', async () => {
      const response = await request(app)
        .post('/api/create-invite')
        .set('Authorization', 'InvalidToken')
        .send({ privileges: 'read-write' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 400 if privileges are missing', async () => {
      const response = await request(app)
        .post('/api/create-invite')
        .set('Authorization', OWNER_TOKEN!);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid privileges provided');
    });

    it('should return 200 and a valid invite token if correct input is provided', async () => {
      const response = await request(app)
        .post('/api/create-invite')
        .set('Authorization', OWNER_TOKEN!)
        .send({ privileges: 'read-write' });

      expect(response.status).toBe(200);
      expect(response.body.invite).toBeDefined();

      const inviteTokenParts = response.body.invite.split('.');
      expect(inviteTokenParts.length).toBe(2);
    });
  });

  describe('POST /api/accept-invite', () => {
    let inviteToken: string;
  
    beforeAll(async () => {
      // Create a valid invite token for testing the accept invite endpoint
      const response = await request(app)
        .post('/api/create-invite')
        .set('Authorization', OWNER_TOKEN!)
        .send({ privileges: 'read-write' });
  
      inviteToken = response.body.invite;
    });
  
    it('should return 400 if invite token is missing', async () => {
      const response = await request(app)
        .post('/api/accept-invite')
        .send({});
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invite token is required');
    });
  
    it('should return 400 if invite token format is invalid', async () => {
      const response = await request(app)
        .post('/api/accept-invite')
        .send({ inviteToken: 'invalidInviteToken' });
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid invite token format');
    });
  
    it('should return 403 if the invite token signature is invalid', async () => {
      // Tamper with the invite token to make it invalid, while keeping the length valid (64 bytes)
      const [inviteDataBase64, originalSignatureBase64] = inviteToken.split('.');
      const tamperedSignatureBuffer = Uint8Array.from(Buffer.from(originalSignatureBase64, 'base64')).map(byte => byte ^ 0xff); // XOR to change original signature
      const tamperedSignatureBase64 = Buffer.from(tamperedSignatureBuffer).toString('base64');
      const tamperedInviteToken = `${inviteDataBase64}.${tamperedSignatureBase64}`;
  
      const response = await request(app)
        .post('/api/accept-invite')
        .send({ inviteToken: tamperedInviteToken });
  
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid invite token signature');
    });
  
    it('should return 200 if the invite token is valid', async () => {
      const response = await request(app)
        .post('/api/accept-invite')
        .send({ inviteToken });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Invite accepted successfully');
    });
  });
});
