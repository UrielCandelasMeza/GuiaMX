/**
 * Fetch wrapper that attaches the Authorization token
 * and the base API URL from env variables.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type FetchOptions = RequestInit & {
  token?: string;
};

async function apiFetch<T = unknown>(
  path: string,
  { token, ...options }: FetchOptions = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error ${res.status}: ${error}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "GET", ...opts }),

  post: <T>(path: string, body: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...opts,
    }),

  put: <T>(path: string, body: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
      ...opts,
    }),

  delete: <T>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "DELETE", ...opts }),
};
