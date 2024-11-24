// src/websockets.ts
import { WebSocketServer, WebSocket } from "ws";
import { verifyJWT } from "./utils/jwt";
import messageService from "./services/messageService";
import { WebSocketWithMetadata, ClientMetadataHeader, ClientMetadata } from "./models";

import { Server } from "http";
import { parse } from "url";

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocketWithMetadata, req) => {
    // Extract the authorization header from the request
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      ws.close(4001, "No authorization header provided");
      return;
    }

    const token = authHeader.split(" ")[1]; // expecting 'Bearer sessionToken'

    if (!token) {
      ws.close(4002, "Invalid authorization header format");
      return;
    }

    let publicKey: string = "";
    try {
      // Verify the JWT
      const payload = verifyJWT(token);
      if (!payload) {
        ws.close(4003, "Invalid or expired session token");
        return;
      }
      // Attach the publicKey to the WebSocket object for use in message handlers
      publicKey = payload.sub;
    } catch (error) {
      if (error instanceof Error) {
        console.error("JWT verification error:", error.message);
      } else {
        console.error("JWT verification error:", error);
      }
      ws.close(4001, "Invalid or malformed session token");
      return;
    }

    // Extract client metadata from query parameters
    const query = parse(req.url || "", true).query;
    const clientMetadataString = query.clientMetadata as string;
    if (clientMetadataString) {
      try {
        const headerData = JSON.parse(decodeURIComponent(clientMetadataString)) as ClientMetadataHeader;
        const clientMetadata: ClientMetadata = {
          ...headerData,
          publicKey,
          privilege: "user",
          timestamp: Date.now(),
        };
        console.log("Client Metadata:", clientMetadata);
        ws.clientMetadata = clientMetadata;
      } catch (e) {
        console.error("Invalid JSON in clientMetadata query parameter:", e);
        ws.close(4004, "Invalid clientMetadata query parameter format");
        return;
      }
    } else {
      console.error("Missing clientMetadata query parameter");
      ws.close(4005, "Missing clientMetadata query parameter");
      return;
    }

    console.log("New authenticated WebSocket connection");
    messageService.addClient(ws);

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      messageService.removeClient(ws);
    });

    // This is here for testing only
    // messages with side effects
    // will be sent through the REST API
    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      console.log("Received message:", message);

      // Dispatch message based on type
      switch (message.type) {
        case "example":
          handleExampleMessage(message.payload, ws);
          break;
        default:
          ws.send(JSON.stringify({ error: "Unknown message type" }));
      }
    });
  });

  return wss;
}

export function handleExampleMessage(message: any, ws: WebSocketWithMetadata) {
  console.log("Handling example message:", message);

  // Example response logic
  const response = { type: "example", payload: "This is an example response" };
  ws.send(JSON.stringify(response));
}
