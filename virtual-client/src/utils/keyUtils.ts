import nacl from "tweetnacl";

export function generateKeyPair() {
  const keyPair = nacl.sign.keyPair();
  return {
    publicKeyUint8: keyPair.publicKey,
    privateKeyUint8: keyPair.secretKey,
    publicKeyBase64: Buffer.from(keyPair.publicKey).toString("base64"),
  };
}

export function signNonce(nonceBase64: string, privateKeyUint8: Uint8Array): string {
  const nonceUint8 = Buffer.from(nonceBase64, "base64");
  const signatureUint8 = nacl.sign.detached(nonceUint8, privateKeyUint8);
  return Buffer.from(signatureUint8).toString("base64");
}
