// src/types.ts

export interface AcceptInviteResponse {
  sessionToken: string;
}

export interface LoginResponse {
  nonce: string;
}

export interface ConfirmLoginResponse {
  sessionToken: string;
}

export interface ProtectedRouteResponse {
  data: string;
}

export interface ReplyResponse {
  messageId: string;
}

export interface ClientMetadataHeader {
  name: string;
}
