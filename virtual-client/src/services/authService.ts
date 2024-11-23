import { apiRequest } from "../utils/fetchUtils";
import {
  AcceptInviteResponse,
  LoginResponse,
  ConfirmLoginResponse,
  ProtectedRouteResponse,
  ReplyResponse,
} from "../types";

export async function acceptInvite(inviteToken: string, publicKey: string): Promise<AcceptInviteResponse> {
  return apiRequest<AcceptInviteResponse>("/api/accept-invite", {
    method: "POST",
    body: JSON.stringify({ inviteToken, publicKey }),
  });
}

export async function login(publicKey: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/login", {
    method: "POST",
    body: JSON.stringify({ publicKey }),
  });
}

export async function confirmLogin(publicKey: string, signature: string): Promise<string> {
  const { sessionToken } = await apiRequest<ConfirmLoginResponse>("/api/confirm-login", {
    method: "POST",
    body: JSON.stringify({ publicKey, signature }),
  });
  return sessionToken;
}

export async function accessProtectedRoute(sessionToken: string): Promise<ProtectedRouteResponse> {
  return apiRequest<ProtectedRouteResponse>("/api/protected", {
    method: "GET",
  }, sessionToken);
}

export async function sendMessage(sessionToken: string, message: any): Promise<ReplyResponse> {
  return apiRequest<ReplyResponse>("/api/reply", {
    method: "POST",
    body: JSON.stringify(message),
  }, sessionToken);
}
