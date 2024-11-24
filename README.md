# peerchat

## Goals

The goal of this system is to allow users to host their own full-featured public chat server at low cost so that it can fit into the free tier of hosting services like fly.io. The chat system has multi-media capabilties based on WebRTC: sharing of photos, voice chat, and other features. This all operates at zero or near zero costs because it does not rely on a server-side database to store and move data around. The server is a secure relay, it guarentees identity of clients and signs relayed messages so there is an authentic chat history. However, the server itself is close to stateless: other than keeping track of which users are online at the moment, it stores no data.

The upside for you is that only you, and the people you send them to, have your messages long term. You can deploy and run you own private server for free if you are willing to learn a *little bit* about server hosting.

Inside, this architecture depends on fancy server side concepts like eliptic curve security, WebSockets, WebRTC signalling, and hybrid gossip protocols: a genuine nerd-fest of technology. But for the end user, we hope it is just good multimedia chat with a lot more real privacy than we have become used to.

## Project structure

### Server

This is node.js, typescript server with a basic Dockerfile to allow it to be deployed on fly.io (more deployment options will come later.) The server has no database. It depends on a client public keys (Ed25519) to prove identity. The server has a private key also that is uses to sign messages to verify the sender, content and time. The server creates unique ids for messages and attachments (e.g. photos). These keys sort in lexiographic order by time, and can be used on the client to create a chat history. 

### Client

A React application that supports multimedia chat over channels, and shows the online status of other users. Unlike the server, the client has a database, based on the Web Storage API and indexedDB in your browser. The server-generated keys are used in indexedDB, so all client databases use the same keys, simplifying the process of synschonizing client databases when needed. A gossip protocol and a pull as needed protocol allow peer clients to syncronize message history and message attachments. A key part of this system is Trust. The clients know each other and trust each other because of the Ed25519 public/private keys. Because of this, client can syncronize their databases with peer-to-peer WebRTC transfers whenever needed. Because the big data transfers are between peers, noone ever has to pay big server hosting charges. The server never even holds the data for attachments like photos, it only knows them by metadata and digest. The digest of an attachment is computed by the originating client and sent to the server that generates a unique, sortable id for an attachment with that digest.

### Virtual client

Like the server, this is a node.js typescript app, but it functions only as a REST and WebSocket client and a WebRTC peer. Virtual clients help provide a reasonable user experience when only one real client is online. The do not have big databases like real client, but will cache the last few hours of messages and attachments. They participate in the gossip protocol, but at a lower priority, since they are server hosted and have far less resources than a laptop or mobile phone.

## Current project status

This is a work in progress, I have a good chunk of the server working. The virtual client is coming along, and I am using it to test and tune the gossip protocols. Once I have the protocols in good shape, I will move them to a shared library in the pnpm mono-repo and start work on the React client -- that's when the fun starts and I can get players to test it.

### TODO
** This a brief roadmap of the next few days to help me keep track of things**

Automate startup of virtual clients, maybe 10 at a time for testing.

(DONE, needs test) Server distributes login channel (set) to clients upon connection.

Set up a WebRTC signalling for data channel between client.

Have virtual clients send recent message history to new logins. Should this be initiated by the client with the history (gossip protocol) and initiate by the newly logged in client (pull protocol)? Maybe both makes sense.


## Architecture

Here is the big picture for the long term.

**Peer-to-Peer Game Chat Architecture**

**Introduction**

This architecture outlines a scalable and efficient peer-to-peer game chat system that combines a lightweight, stateless server with peer-to-peer communication. It is designed to minimize server hosting costs while providing low-latency real-time text messaging and efficient distribution of larger media files among players.

---

**1. Stateless Server as a Rally Point**

- **Matchmaking and Trust Establishment**:
  - The stateless server acts as a central rally point for players to find and connect with each other.
  - It verifies player identities using **public keys** and signs match data to establish trusted connections.
- **WebRTC Signaling Management**:
  - Handles the signaling required to establish **peer-to-peer (P2P) connections** between clients.
- **Low-Latency Text Message Relay**:
  - Relays real-time text messages via **WebSocket connections** during matchmaking and gameplay.
  - Maintains low operational overhead by keeping the server stateless and lightweight.

---

**2. Peer-to-Peer Data Transfer for Larger Objects**

- **Gossip Protocol for Data Dissemination**:
  - Utilizes a **gossip protocol** to distribute larger chat-related data (e.g., images) among peers.
  - The client initiating the data transfer sends it to randomly selected peers, creating a **chain reaction** that propagates the data throughout the network.
- **Digest-Based Verification**:
  - Employs **cryptographic hashes** (e.g., SHA-256) as lightweight identifiers.
  - Peers use these hashes to check if they already possess the data before downloading, reducing redundant data transfers and optimizing network usage.

---

**3. Push/Pull Data Propagation Strategy**

- **Push via Gossip Protocol**:
  - Rapidly spreads data to the majority of clients (~80%) through the gossip mechanism.
  - Efficient for quick dissemination without overloading any single node.
- **Pull on Demand**:
  - Clients can **request (pull)** data from peers if they haven't received it yet, especially if a user action triggers the need for the data (e.g., viewing a new image).
  - Enhances responsiveness and ensures that all clients can access the data promptly.
- **Combined Push/Pull Benefits**:
  - The hybrid approach ensures efficient data propagation.
  - The **push** mechanism handles rapid distribution, while the **pull** mechanism ensures completeness and responsiveness for all clients.

---

**4. Channel History and Virtual Clients**

- **Onboarding New Clients**:
  - Newly connected clients can request the **channel history** from peers to quickly synchronize with ongoing conversations.
- **Virtual Clients as Peers of Last Resort**:
  - Serve as backup sources for chat history when no other peers with the necessary data are online.
  - Operate at a **low priority** to minimize resource consumption and are utilized only when necessary.

---

**5. Efficiency and Scalability**

- **Minimized Server Hosting Costs**:
  - Heavy data transfers are handled via P2P communication, reducing the server's bandwidth requirements.
  - The stateless nature of the server lowers operational overhead.
- **Optimized User Experience**:
  - Combines **low-latency real-time text messaging** with a **distributed, event-driven approach** for larger media.
  - Ensures users experience seamless communication without delays or significant waiting times.
- **Scalability**:
  - The architecture gracefully handles an increasing number of clients without degrading performance.
  - Distributes workload across peers, preventing bottlenecks and single points of failure.

---

**Conclusion**

This peer-to-peer game chat architecture effectively balances efficiency, scalability, and user experience by:

- Leveraging a lightweight, stateless server for critical functions like matchmaking, trust establishment, and real-time text messaging.
- Utilizing a gossip protocol combined with a push/pull strategy to disseminate larger data efficiently among peers.
- Implementing digest-based verification to optimize network resources and prevent unnecessary data transfers.
- Providing mechanisms for new clients to quickly synchronize with ongoing conversations and ensuring data availability through virtual clients when needed.

By offloading heavy data transfers to peer-to-peer networks and maintaining a minimal server footprint, the system delivers a robust chat experience with reduced hosting costs and high scalability.

