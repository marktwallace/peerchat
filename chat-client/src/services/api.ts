// services/api.ts

export async function acceptInvite(
  inviteToken: string,
  publicKey: string
): Promise<any> {
  const response = await fetch("/api/accept-invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inviteToken, publicKey }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return response.json();
}
