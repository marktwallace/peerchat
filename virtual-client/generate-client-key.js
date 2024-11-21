// generate_key.js
const nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

// Generate a new key pair
const keyPair = nacl.sign.keyPair();

// Encode the public key in Base64
const publicKeyBase64 = nacl.util.encodeBase64(keyPair.publicKey);

// Print the public key
console.log('Public Key (Base64):', publicKeyBase64);

// Optionally, save the private key for later use
const privateKeyBase64 = nacl.util.encodeBase64(keyPair.secretKey);
console.log('Private Key (Base64):', privateKeyBase64);
