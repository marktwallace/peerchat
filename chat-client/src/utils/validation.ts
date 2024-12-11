import nacl from "tweetnacl";

export function validateEd25519Keys(publicKeyBase64: string, privateKeyBase64: string): boolean {
  try {
    // Decode Base64 keys
    const publicKey = Uint8Array.from(atob(publicKeyBase64), (c) => c.charCodeAt(0));
    const privateKey = Uint8Array.from(atob(privateKeyBase64), (c) => c.charCodeAt(0));

    // Validate lengths
    if (publicKey.length !== 32) {
      throw new Error("Invalid public key length. Ed25519 public keys must be 32 bytes.");
    }
    if (privateKey.length !== 64) {
      throw new Error("Invalid private key length. Ed25519 private keys must be 64 bytes.");
    }

    // Validate the public key corresponds to the private key
    const derivedPublicKey = nacl.sign.keyPair.fromSecretKey(privateKey).publicKey;
    if (!publicKey.every((byte, i) => byte === derivedPublicKey[i])) {
      throw new Error("Public key does not match the private key.");
    }

    return true; // Validation passed
  } catch (error) {
    if (error instanceof Error) {
      console.error("Key validation failed:", error.message);
    } else {
      console.error("Key validation failed:", error);
    }
    return false; // Validation failed
  }
}
