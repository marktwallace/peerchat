import { generateKeyPair, signNonce } from "./utils/keyUtils";
import { acceptInvite, login, confirmLogin, accessProtectedRoute, sendMessage } from "./services/authService";
import { connectWebSocket } from "./services/wsService";

export async function startClient(inviteToken: string) {
  console.log("Invite Token:", inviteToken);

  // Generate key pair
  const { publicKeyBase64, privateKeyUint8 } = generateKeyPair();
  console.log("Generated Public Key:", publicKeyBase64);

  // Step 1: Accept Invite
  const { sessionToken } = await acceptInvite(inviteToken, publicKeyBase64);
  console.log("Invite accepted successfully. Session Token:", sessionToken);

  // Step 2: Initiate Login
  const { nonce } = await login(publicKeyBase64);
  console.log("Received nonce from server:", nonce);

  // Step 3: Confirm Login
  const signatureBase64 = signNonce(nonce, privateKeyUint8);
  const confirmedSessionToken = await confirmLogin(publicKeyBase64, signatureBase64);
  console.log("Login confirmed. Session Token:", confirmedSessionToken);

  // Step 4: Connect to WebSocket
  const clientMetadata = { publicKey: publicKeyBase64, privilege: "user", timestamp: Date.now() };
  const ws = await connectWebSocket(confirmedSessionToken,{"name":"Abby"});

  // Step 5: Access Protected Route
  const protectedData = await accessProtectedRoute(confirmedSessionToken);
  console.log("Protected Data:", protectedData);

  // Step 6: Send a Message
  const message = { text: "Hello, WebSocket!" };
  const reply = await sendMessage(confirmedSessionToken, message);
  console.log("Message sent:", reply);
}
