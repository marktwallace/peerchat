import nacl from 'tweetnacl';

const PRIVATE_KEY_BASE64 = process.env.CATALK_PRIVATE_KEY;
const serverPrivateKeyUint8 = Uint8Array.from(Buffer.from(PRIVATE_KEY_BASE64, 'base64'));

function signMessage(message) {
  const messageString = JSON.stringify(message);
  const messageUint8 = new TextEncoder().encode(messageString);
  const signatureUint8 = nacl.sign.detached(messageUint8, serverPrivateKeyUint8);
  const signatureBase64 = Buffer.from(signatureUint8).toString('base64');
  return {
    message,
    signature: signatureBase64,
  };
}

export { signMessage };
