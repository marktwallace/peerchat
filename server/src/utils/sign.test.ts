// src/utils/sign.test.ts
import { signMessage } from './sign';
import nacl from 'tweetnacl';

const PRIVATE_KEY_BASE64 = process.env.PEERCHAT_PRIVATE_KEY;
const PUBLIC_KEY_BASE64 = process.env.PEERCHAT_PUBLIC_KEY;
if (!PRIVATE_KEY_BASE64 || !PUBLIC_KEY_BASE64) {
  throw new Error('PEERCHAT_PRIVATE_KEY environment variable is not set');
}
const serverPrivateKeyUint8 = Uint8Array.from(Buffer.from(PRIVATE_KEY_BASE64, 'base64'));
const serverPublicKeyUint8 = Uint8Array.from(Buffer.from(PUBLIC_KEY_BASE64, 'base64'));

describe('signMessage', () => {
  it('should return an object containing the original message and a signature', () => {
    const message = { text: 'Hello, World!' };
    const signedMessage = signMessage(message);
    expect(signedMessage).toHaveProperty('message');
    expect(signedMessage).toHaveProperty('signature');
    expect(signedMessage.message).toEqual(message);
  });

  it('should generate a valid signature for the given message', () => {
    const message = { text: 'Hello, World!' };
    const signedMessage = signMessage(message);
    const messageUint8 = new TextEncoder().encode(JSON.stringify(message));
    const signatureUint8 = Uint8Array.from(Buffer.from(signedMessage.signature, 'base64'));

    // Use the public key to verify the signature
    const isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, serverPublicKeyUint8);
    expect(isValid).toBe(true);
  });

  it('should generate different signatures for different messages', () => {
    const message1 = { text: 'Hello, World!' };
    const message2 = { text: 'Goodbye, World!' };
    const signedMessage1 = signMessage(message1);
    const signedMessage2 = signMessage(message2);

    expect(signedMessage1.signature).not.toBe(signedMessage2.signature);
  });
});
