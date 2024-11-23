const SERVER_URL = "http://localhost:6765";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${SERVER_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
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
