// src/utils/jwt.js
import nacl from 'tweetnacl';

const PRIVATE_KEY_BASE64 = process.env.PEERCHAT_PRIVATE_KEY;
const PUBLIC_KEY_BASE64 = process.env.PEERCHAT_PUBLIC_KEY
if (!PRIVATE_KEY_BASE64 || !PUBLIC_KEY_BASE64) {
  throw new Error('Environment variables PEERCHAT_PRIVATE_KEY and PEERCHAT_PUBLIC_KEY must be set');
}

const serverPrivateKeyUint8 = Uint8Array.from(Buffer.from(PRIVATE_KEY_BASE64, 'base64'));
const serverPublicKeyUint8 = Uint8Array.from(Buffer.from(PUBLIC_KEY_BASE64, 'base64'));

// Helper functions for base64url encoding and decoding
export function base64urlEncode(buffer: Uint8Array): string {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function base64urlDecode(str: string): Uint8Array {
  // Pad with '=' to make the length a multiple of 4
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64');
}

// Function to create a JWT
export function createJWT(header: object, payload: object): string {
  const headerJSON = JSON.stringify(header);
  const payloadJSON = JSON.stringify(payload);

  const encodedHeader = base64urlEncode(new TextEncoder().encode(headerJSON));
  const encodedPayload = base64urlEncode(new TextEncoder().encode(payloadJSON));

  const message = encodedHeader + '.' + encodedPayload;
  const messageUint8 = new Uint8Array(Buffer.from(message));
  const signatureUint8 = nacl.sign.detached(messageUint8, serverPrivateKeyUint8);
  const encodedSignature = base64urlEncode(signatureUint8);
  const jwt = message + '.' + encodedSignature;
  return jwt;
}

// Function to verify a JWT
export function verifyJWT(jwt: string): object | null {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    return null;
  }
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const message = encodedHeader + '.' + encodedPayload;
  const messageUint8 = new Uint8Array(Buffer.from(message));
  const signatureUint8 = new Uint8Array(base64urlDecode(encodedSignature));

  // Check if the signature length is valid
  if (signatureUint8.length !== 64) {
    return null; // Invalid signature length
  }

  const isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, serverPublicKeyUint8);
  if (!isValid) {
    return null;
  }

  // Parse the payload and check expiration
  const payloadJSON = Buffer.from(base64urlDecode(encodedPayload)).toString('utf8');
  const payload = JSON.parse(payloadJSON);

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null; // Token has expired
  }

  return payload; // Return the payload if valid
}
