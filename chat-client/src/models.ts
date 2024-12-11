// src/models.tsx

export interface SignalMessage {
  type: string;
  from: string;
  to: string;
  payload: any;
}

export interface ClientMetadataHeader {
  name: string;
}

export interface ClientMetadata extends ClientMetadataHeader {
  publicKey: string;
  privilege: string;
  timestamp: number;
}
