// src/services/peerService.ts
import { ClientMetadata } from "../models";
import WebSocket from "ws";

class PeerService {
  private static instance: PeerService | null = null;
  private ws: WebSocket;
  private clientId: string;
  private peers: Map<string, ClientMetadata>;

  private constructor(ws: WebSocket, clientId: string) {
    this.ws = ws;
    this.clientId = clientId;
    this.peers = new Map();

    this.initializeMessageHandlers();
  }

  public static initialize(ws: WebSocket, clientId: string): void {
    if (!PeerService.instance) {
      PeerService.instance = new PeerService(ws, clientId);
    } else {
      console.warn("PeerService is already initialized.");
    }
  }

  public static getInstance(): PeerService {
    if (!PeerService.instance) {
      throw new Error("PeerService has not been initialized. Call initialize() first.");
    }
    return PeerService.instance;
  }

  private initializeMessageHandlers(): void {
    console.log("Initializing PeerService message handlers");
    this.ws.on("message", (data: string) => {
      try {
        const message = JSON.parse(data);
        switch (message.type) {
          case "clientList":
            this.handleClientList(message.clientList);
            break;
          case "connect":
            this.handleClientConnect(message.metadata);
            break;
          case "disconnect":
            this.handleClientDisconnect(message.metadata);
            break;
        }
      } catch (error) {
        console.error("Failed to parse message", error);
      }
    });
  }

  private handleClientList(clientList: ClientMetadata[]): void {
    this.peers.clear();
    clientList.forEach((client) => {
      if (client.publicKey !== this.clientId) {
        this.peers.set(client.publicKey, client);
      }
    });
    console.log("Updated peer list:", Array.from(this.peers.values()));
  }

  private handleClientConnect(clientMetadata: ClientMetadata): void {
    if (clientMetadata.publicKey !== this.clientId) {
      this.peers.set(clientMetadata.publicKey, clientMetadata);
      console.log("Client connected:", clientMetadata);
    }
  }

  private handleClientDisconnect(clientMetadata: ClientMetadata): void {
    if (this.peers.has(clientMetadata.publicKey)) {
      this.peers.delete(clientMetadata.publicKey);
      console.log("Client disconnected:", clientMetadata);
    }
  }

  public getRandomPeer(): ClientMetadata | null {
    const peerKeys = Array.from(this.peers.keys());
    if (peerKeys.length === 0) {
      return null;
    }
    const randomKey = peerKeys[Math.floor(Math.random() * peerKeys.length)];
    return this.peers.get(randomKey) || null;
  }
}

export default PeerService;
