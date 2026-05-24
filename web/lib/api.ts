const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Wrapper de fetch institucional.
 * - Añade Content-Type: application/json
 * - Añade Authorization: Bearer <token> si se pasa
 * - Lanza Error con el mensaje del body si status >= 400
 * - Retorna el JSON parseado
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status >= 400) {
    let message = `Error ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      message = body.message ?? message;
    } catch {
      // body vacío — usa el mensaje por defecto
    }
    throw new Error(message);
  }

  // 204 No Content → retorna null en lugar de fallar al parsear
  if (res.status === 204) return null as T;

  return res.json() as Promise<T>;
}
