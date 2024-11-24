// src/services/wsService.ts
import WebSocket from "ws";
import { ClientMetadataHeader } from "../types";

export async function connectWebSocket(sessionToken: string, clientMetadataHeader: ClientMetadataHeader): Promise<WebSocket> {
  const clientMetadataQuery = encodeURIComponent(JSON.stringify(clientMetadataHeader));
  const ws = new WebSocket(`ws://localhost:6765/ws?clientMetadata=${clientMetadataQuery}`, {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  ws.on("open", () => {
    console.log("WebSocket connection opened");
  });

  ws.on("message", (data) => {
    console.log("Received WebSocket message:", JSON.parse(data.toString()));
  });

  ws.on("close", (event: { code: number; reason: string }) => {
    console.error("WebSocket closed:", event.code, event.reason);
  });

  return ws;
}
