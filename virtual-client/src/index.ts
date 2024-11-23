import { startClient } from "./app";

const inviteToken = process.argv[2];

if (!inviteToken) {
  console.error("Error: Invite token is required as a command-line parameter.");
  process.exit(1);
}

startClient(inviteToken).catch((error) => {
  console.error("Error running client:", error);
  process.exit(1);
});
