// src/controllers/inviteController.js
import nacl from 'tweetnacl';
import { Request, Response, NextFunction } from 'express';

const PRIVATE_KEY_BASE64 = process.env.PEERCHAT_PRIVATE_KEY;
const PUBLIC_KEY_BASE64 = process.env.PEERCHAT_PUBLIC_KEY;
if (!PRIVATE_KEY_BASE64 || !PUBLIC_KEY_BASE64) {
  throw new Error('Environment variables PEERCHAT_PRIVATE_KEY and PEERCHAT_PUBLIC_KEY must be set');
}
const serverPrivateKeyUint8 = Uint8Array.from(Buffer.from(PRIVATE_KEY_BASE64, 'base64'));
const serverPublicKeyUint8 = Uint8Array.from(Buffer.from(PUBLIC_KEY_BASE64, 'base64'));
console.log('Decoded private key length:', serverPrivateKeyUint8.length); // Should be 64
console.log('Decoded public key length:', serverPublicKeyUint8.length); // Should be 32

/* TEST WITH:
curl -X POST http://localhost:6765/api/create-invite \
  -H "Authorization: $PEERCHAT_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"privileges": "read-write"}'
*/

export async function createInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ownerToken = req.headers['authorization'];

  if (ownerToken !== process.env.PEERCHAT_OWNER_TOKEN) {
    res.status(403).json({ error: 'Unauthorized' });
    return;
  }

  const { privileges } = req.body;

  if (!privileges || typeof privileges !== 'string') {
    res.status(400).json({ error: 'Invalid privileges provided' });
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const inviteString = `${privileges}|${timestamp}`;
  const inviteBuffer = new TextEncoder().encode(inviteString);

  try {
    // Use the 64-byte private key directly for signing
    const signature = nacl.sign.detached(inviteBuffer, serverPrivateKeyUint8);
    const signatureBase64 = Buffer.from(signature).toString('base64');

    const inviteToken = `${Buffer.from(inviteBuffer).toString('base64')}.${signatureBase64}`;

    res.json({ invite: inviteToken });
  } catch (error) {
    console.error('Error signing invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* TEST WITH:
curl -X POST http://localhost:6765/api/accept-invite \
  -H "Content-Type: application/json" \
  -d '{"inviteToken": "your_invite_token_here", "publicKey": "your_public_key_here"}'
*/
//export async function acceptInvite(req: Request, res: Response) {
export async function acceptInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { inviteToken } = req.body;

  if (!inviteToken) {
    res.status(400).json({ error: 'Invite token is required' });
    return;
  }

  const [inviteDataBase64, providedSignatureBase64] = inviteToken.split('.');
  if (!inviteDataBase64 || !providedSignatureBase64) {
    res.status(400).json({ error: 'Invalid invite token format' });
    return;
  }

  try {
    // Attempt to decode Base64 inputs
    const inviteData = Uint8Array.from(Buffer.from(inviteDataBase64, 'base64'));
    const providedSignature = Uint8Array.from(Buffer.from(providedSignatureBase64, 'base64'));

    // Verify the signature using the public key
    const isVerified = nacl.sign.detached.verify(inviteData, providedSignature, serverPublicKeyUint8);

    if (!isVerified) {
      res.status(403).json({ error: 'Invalid invite token signature' });
      return;
    }

    // Proceed with accepting the invite
    res.status(200).json({ message: 'Invite accepted successfully' });
  } catch (error) {
    if (error instanceof TypeError && error.message === 'invalid encoding') {
      // Handle invalid Base64 encoding
      console.warn('Invalid Base64 encoding in invite token');
      res.status(400).json({ error: 'Invalid invite token format' });
      return;
    } else {
      // Log minimal error information for unexpected errors
      if (error instanceof Error) {
        console.error('Unexpected error in acceptInvite:', error.message);
      } else {
        console.error('Unexpected error in acceptInvite:', error);
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
