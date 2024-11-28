// src/services/wsService.ts
import WebSocket from "ws";
import { ClientMetadataHeader } from "../models";
import PeerService from "./peerService";
import WebRtcService from "./webRtcService";

class WsService {
  private static instance: WsService | null = null;
  private ws: WebSocket | null = null;

  private constructor() {}

  public static getInstance(): WsService {
    if (!WsService.instance) {
      WsService.instance = new WsService();
    }
    return WsService.instance;
  }

  public async connectWebSocket(
    sessionToken: string,
    clientMetadataHeader: ClientMetadataHeader,
    clientId: string
  ): Promise<WebSocket> {
    const clientMetadataQuery = encodeURIComponent(JSON.stringify(clientMetadataHeader));
    this.ws = new WebSocket(`ws://localhost:6765/ws?clientMetadata=${clientMetadataQuery}`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    this.ws.on("open", () => {
      console.log("WebSocket connection opened");

      // Initialize PeerService as singleton
      PeerService.initialize(this.ws!, clientId);

      // Create a new WebRtcService instance for this WebSocket connection
      new WebRtcService(this.ws!, clientId);
    });

    this.ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      console.log("Received WebSocket message:", msg);
    });
  
    this.ws.on("close", (event: { code: number; reason: string }) => {
      console.error("WebSocket closed:", event.code, event.reason);
    });
  
    return this.ws;
  }

  public getWebSocket(): WebSocket {
    if (!this.ws) {
      throw new Error("WebSocket is not connected. Call connectWebSocket() first.");
    }
    return this.ws;
  }
}

export default WsService;
