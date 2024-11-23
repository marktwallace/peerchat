import { Request, Response, NextFunction } from 'express';
import WebSocket from 'ws';

export interface RequestWithPublicKey extends Request {
  publicKey?: string;
}

export interface WebSocketWithMetadata extends WebSocket {
  clientMetadata?: ClientMetadata;
}

export interface ClientMetadataHeader {
  name: string;
}

export interface ClientMetadata extends ClientMetadataHeader {
  publicKey: string;
  privilege: string;
  timestamp: number;
}

export interface JwtPayload {
  sub: string; // Subject of the JWT, in this case, the client's public key
  exp: number; // Expiration time as a Unix timestamp
  iat: number; // Issued at time as a Unix timestamp
}

export interface Reply {
  id: string; 
  // Reply id in base64: 
  //  8 chars ms since Jan 1, 2024
  //  2 char channel id
  //  2 char counter from server
  pk: string;
  // Public key of the sender
  text: string;
  // Text of the reply
  //  can include @mentions
}

export interface Login {
  pk: string; // Public key of the user
  name: string; // User's name
  py: string; // priority of the user for peer queries
}

