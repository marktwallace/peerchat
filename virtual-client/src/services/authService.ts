// src/services/authService.ts
import { AcceptInviteResponse, LoginResponse, ConfirmLoginResponse, ProtectedRouteResponse, ReplyResponse } from "../types";

const SERVER_URL = "http://localhost:6765";

export async function acceptInvite(inviteToken: string, publicKey: string): Promise<AcceptInviteResponse> {
  const response = await fetch(`${SERVER_URL}/api/accept-invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inviteToken, publicKey }),
  });
  return handleResponse(response);
}

export async function login(publicKey: string): Promise<LoginResponse> {
  const response = await fetch(`${SERVER_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicKey }),
  });
  return handleResponse(response);
}

export async function confirmLogin(publicKey: string, signature: string): Promise<string> {
  const response = await fetch(`${SERVER_URL}/api/confirm-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicKey, signature }),
  });
  const data = await handleResponse<ConfirmLoginResponse>(response);
  return data.sessionToken;
}

export async function accessProtectedRoute(sessionToken: string): Promise<ProtectedRouteResponse> {
  const response = await fetch(`${SERVER_URL}/api/protected`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse(response);
}

export async function sendMessage(sessionToken: string, message: any): Promise<ReplyResponse> {
  const response = await fetch(`${SERVER_URL}/api/reply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  return handleResponse(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(response.statusText || "Response not OK");
    (error as any).details = data;
    throw error;
  }

  return data as T;
}
