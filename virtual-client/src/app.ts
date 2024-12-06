import { generateKeyPair, signNonce } from "./utils/keyUtils";
import {
  acceptInvite,
  login,
  confirmLogin,
  accessProtectedRoute,
  sendMessage,
} from "./services/authService";
import WsService from "./services/wsService";
import PeerService from "./services/peerService";

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
  const confirmedSessionToken = await confirmLogin(
    publicKeyBase64,
    signatureBase64
  );
  console.log("Login confirmed. Session Token:", confirmedSessionToken);

  // Step 4: Connect to WebSocket
  const clientMetadataHeader = {
    name: "Mark",
    privilege: "user",
    timestamp: Date.now(),
  };
  const wsService = WsService.getInstance();
  await wsService.connectWebSocket(
    confirmedSessionToken,
    clientMetadataHeader,
    publicKeyBase64
  );

  // Step 5: Access Protected Route
  const protectedData = await accessProtectedRoute(confirmedSessionToken);
  console.log("Protected Data:", protectedData);

  // Step 6: Send a Message
  const message = { text: "Hello, WebSocket!" };
  const reply = await sendMessage(confirmedSessionToken, message);
  console.log("Message sent:", reply);

  // Step 7: Find a peer
  const peerService = PeerService.getInstance();
  let randomPeer;
  while (true) {
    // Wait for one second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Attempt to find a random peer
    randomPeer = peerService.getRandomPeer();
    console.log("Random peer:", randomPeer);

    // Break the loop if a peer is found
    if (randomPeer) {
      console.log("Peer found, exiting loop.");
      break;
    }
  }

  // Step 8: Make a connection with the peer
  wsService.wrtc?.initiateConnection(randomPeer.publicKey);

  try {
    wsService.wrtc?.sendData(randomPeer.publicKey, {
      type: "chat-message",
      text: "Hello from your peer!",
    });
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}
