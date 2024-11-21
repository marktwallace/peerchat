// utils/jwt.test.ts
import { createJWT, verifyJWT, base64urlEncode, base64urlDecode } from './jwt';
import { JwtPayload } from '../models';

const PRIVATE_KEY_BASE64 = process.env.PEERCHAT_PRIVATE_KEY;
const PUBLIC_KEY_BASE64 = process.env.PEERCHAT_PUBLIC_KEY;

if (!PRIVATE_KEY_BASE64 || !PUBLIC_KEY_BASE64) {
  throw new Error('Environment variables PEERCHAT_PRIVATE_KEY and PEERCHAT_PUBLIC_KEY must be set');
}

const header = { alg: 'EdDSA', typ: 'JWT' };
const payload: JwtPayload = { sub: '1234567890', exp: Math.floor(Date.now() / 1000) + 60, iat: Math.floor(Date.now() / 1000) };

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

    if (verifiedPayload) {
      expect(verifiedPayload.sub).toBe(payload.sub);
      expect(verifiedPayload.exp).toBe(payload.exp);
      expect(verifiedPayload.iat).toBe(payload.iat);
    }
  });

  it('should return null for an invalid JWT', () => {
    // Create a valid JWT and tamper with the signature to make it invalid
    const jwt = createJWT(header, payload);
    const parts = jwt.split('.');
    const tamperedJwt = parts[0] + '.' + parts[1] + '.invalidsignature';
  
    const result = verifyJWT(tamperedJwt);
    expect(result).toBeNull();
  });

  it('should return null for an expired JWT', () => {
    const expiredPayload: JwtPayload = { ...payload, exp: Math.floor(Date.now() / 1000) - 10 };
    const jwt = createJWT(header, expiredPayload);
    const result = verifyJWT(jwt);
    expect(result).toBeNull();
  });
});
