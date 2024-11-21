// generate_keys.js
import nacl from 'tweetnacl';
import fs from "fs";
import path from "path";

// Define the key directory path
const homeDir = process.env.HOME || process.env.USERPROFILE; // Cross-platform compatibility
const keyDir = path.join(homeDir, ".peerchat");

// Create the directory if it doesn't exist
if (!fs.existsSync(keyDir)) {
  fs.mkdirSync(keyDir, { mode: 0o700 });
}

// Define file paths
const privateKeyPath = path.join(keyDir, "private_key_base64.txt");
const publicKeyPath = path.join(keyDir, "public_key_base64.txt");
const ownerTokenPath = path.join(keyDir, "owner_token.txt");

// Check if the key files already exist
if (fs.existsSync(privateKeyPath) || fs.existsSync(publicKeyPath)) {
  console.log("Key files already exist. Not overwriting existing keys.");
} else {
  // Generate a new key pair
  const keyPair = nacl.sign.keyPair();

  // Save the full 64-byte secret key
  fs.writeFileSync(
    privateKeyPath,
    Buffer.from(keyPair.secretKey).toString("base64"),
    { mode: 0o600 }
  );
  fs.writeFileSync(
    publicKeyPath,
    Buffer.from(keyPair.publicKey).toString("base64"),
    { mode: 0o644 }
  );

  console.log("Private key seed and public key have been generated and saved to ~/.catalk.");
}

// Check if the owner token file already exists
if (fs.existsSync(ownerTokenPath)) {
  console.log("Owner token already exists. Not overwriting existing token.");
} else {
  // Generate a random owner token (30 bytes, base64 encoded)
  const ownerTokenBytes = nacl.randomBytes(30);
  const ownerTokenBase64 = Buffer.from(ownerTokenBytes).toString("base64");

  // Save the owner token to a file
  fs.writeFileSync(ownerTokenPath, ownerTokenBase64, { mode: 0o600 });

  console.log("Owner token has been generated and saved to ~/.catalk.");
}
