// utils/jwt.test.ts
import { createJWT, verifyJWT, base64urlEncode, base64urlDecode } from './jwt';
import nacl from 'tweetnacl';

const PRIVATE_KEY_BASE64 = process.env.PEERCHAT_PRIVATE_KEY;
const PUBLIC_KEY_BASE64 = process.env.PEERCHAT_PUBLIC_KEY;
const serverPrivateKeyUint8 = Uint8Array.from(Buffer.from(PRIVATE_KEY_BASE64, 'base64'));
const serverPublicKeyUint8 = Uint8Array.from(Buffer.from(PUBLIC_KEY_BASE64, 'base64'));

const header = { alg: 'EdDSA', typ: 'JWT' };
const payload = { sub: '1234567890', name: 'John Doe', exp: Math.floor(Date.now() / 1000) + 60 };

describe('JWT Utilities', () => {
  it('should base64url encode and decode correctly', () => {
    const buffer = Buffer.from('hello world');
    const encoded = base64urlEncode(buffer);
    const decoded = base64urlDecode(encoded);
    expect(decoded.toString()).toBe(buffer.toString());
  });

  it('should create a valid JWT', () => {
    const jwt = createJWT(header, payload);
    const parts = jwt.split('.');
    expect(parts.length).toBe(3);
  });

  it('should verify a valid JWT', () => {
    const jwt = createJWT(header, payload);
    const verifiedPayload = verifyJWT(jwt);
    expect(verifiedPayload).not.toBeNull();
    expect(verifiedPayload.sub).toBe(payload.sub);
    expect(verifiedPayload.name).toBe(payload.name);
  });

  it('should return null for an invalid JWT', () => {
    const invalidJwt = 'invalid.jwt.token';
    const result = verifyJWT(invalidJwt);
    expect(result).toBeNull();
  });

  it('should return null for an expired JWT', () => {
    const expiredPayload = { ...payload, exp: Math.floor(Date.now() / 1000) - 10 };
    const jwt = createJWT(header, expiredPayload);
    const result = verifyJWT(jwt);
    expect(result).toBeNull();
  });
});
