// src/services/wsService.ts
import WebSocket from "ws";
import { ClientMetadataHeader } from "../models";
import PeerService from "./peerService";
import WebRtcService from "./webRtcService";

class WsService {
  private static instance: WsService | null = null;
  private ws: WebSocket | null = null;

  private constructor() {}

  public wrtc: WebRtcService | undefined;

  public static getInstance(): WsService {
    if (!WsService.instance) {
      WsService.instance = new WsService();
    }
    return WsService.instance;
  }

  public async connectWebSocket(
    sessionToken: string,
    clientMetadataHeader: ClientMetadataHeader,
    clientId: string,
    timeoutMs = 10000 // Timeout after 10 seconds by default
  ): Promise<WebSocket> {
    const clientMetadataQuery = encodeURIComponent(JSON.stringify(clientMetadataHeader));
    this.ws = new WebSocket(`ws://localhost:6765/ws?clientMetadata=${clientMetadataQuery}`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    return new Promise<WebSocket>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.ws?.terminate(); // Clean up if timeout occurs
        reject(new Error("WebSocket connection timed out"));
      }, timeoutMs);

      this.ws!.on("open", () => {
        clearTimeout(timeout);
        console.log("WebSocket connection opened");

        try {
          console.log("Initializing PeerService and WebRtcService");
          // Initialize PeerService as singleton
          PeerService.initialize(this.ws!, clientId);

          // Create a new WebRtcService instance for this WebSocket connection
          this.wrtc = new WebRtcService(this.ws!, clientId);

          resolve(this.ws!);
        } catch (error) {
          reject(error);
        }
      });

      this.ws!.on("error", (err) => {
        clearTimeout(timeout);
        reject(new Error(`WebSocket error: ${err.message}`));
      });

      this.ws!.on("close", (code, reason) => {
        const reasonText = reason.toString() || "No reason provided";
      
        // Log all close events for debugging
        console.error(`[WebSocket Close] Code: ${code}, Reason: ${reasonText}`);
      
        // Check for 4000-series errors
        if (code >= 4000 && code < 5000) {
          console.error(`[WebSocket Close] Server-side application error. Code: ${code}, Reason: ${reasonText}`);
          reject(new Error(`WebSocket closed by server. Error Code: ${code}, Reason: ${reasonText}`));
        } else if (code === 1006) {
          // 1006 indicates abnormal closure
          console.warn(`[WebSocket Close] Abnormal closure detected (Code: ${code}).`);
          reject(new Error(`Abnormal WebSocket closure. Code: ${code}`));
        } else {
          console.log(`[WebSocket Close] Normal or other closure (Code: ${code}).`);
        }
      });
          });
  }

  public getWebSocket(): WebSocket {
    if (!this.ws) {
      throw new Error("WebSocket is not connected. Call connectWebSocket() first.");
    }
    return this.ws;
  }
}

export default WsService;
