# peerchat

**Peer-to-Peer Game Chat Architecture Summary**

- **Hybrid Server-Client Model**:
  - A lightweight, stateless server acts as a **rally point** for matchmaking and establishing trust between players.
  - The server confirms player identities using **public keys** and signs data that establishes a match, ensuring trusted connections.
  - The same server also manages **WebRTC signaling** for peer-to-peer connections.

- **Text Message Relay**:
  - **Low latency text messages** are relayed through WebSocket connections by the stateless server.
  - This allows rapid, real-time conversation during matchmaking and gameplay, while keeping the server lightweight.

- **Gossip Protocol for Larger Objects**:
  - For larger chat-related data (e.g., images), the **gossip protocol** is used to spread the data among peers.
  - The client that posts the image initiates gossip by sending the data to one or more randomly selected peers, triggering a **chain reaction** until all peers receive the image.
  - A **digest (hash)** of the image is used to determine if a peer already has the data before sending the full object, minimizing redundant transfers.

- **Channel History and Virtual Clients**:
  - Newly connected clients can request **channel history** from peers to get up to date quickly.
  - **Virtual clients** act as peers of last resort, providing chat history when no other client with the necessary data is online.
  - Virtual clients operate at a **low priority**, minimizing their role unless no other options are available.

- **Digest-Based Verification**:
  - **Cryptographic hashes** (e.g., SHA-256) are used as lightweight identifiers to verify whether a client already has a larger object, preventing redundant data transmission.
  - This ensures efficient propagation of large objects, reducing network load.

- **Efficiency and Scalability**:
  - The design focuses on minimizing server hosting costs by relying on **peer-to-peer communication** for heavy data transfers.
  - The use of a **stateless server** for signaling and trust ensures low operational overhead while maintaining data integrity and efficient communication.
  - The architecture effectively combines **low-latency real-time text** with a **distributed, event-driven approach** to spread larger media, ensuring an optimized user experience without significant hosting costs.

## TODO

Automate startup of virtual clients.

Server distributes login channel (set) to clients upon connection.

Have virtual clients send recent message history to new logins. Should this be initiated by the client with the history (gossip protocol) and initiate by the newly logged in client (pull protocol)? Maybe both makes sense.

To do this, set up a WebRTC data channel.
