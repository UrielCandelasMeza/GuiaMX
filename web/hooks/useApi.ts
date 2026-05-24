"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import type { Tramite } from "@/types";

/* ── Fetchers tipados ────────────────────────────────────────────────────── */
function makeFetcher<T>(token?: string) {
  return (url: string): Promise<T> => apiFetch<T>(url, {}, token);
}

function makeTupleFetcher<T>() {
  return ([url, token]: [string, string]): Promise<T> =>
    apiFetch<T>(url, {}, token);
}

/* ── useTramites ─────────────────────────────────────────────────────────── */
/**
 * Lista pública de trámites disponibles.
 * No requiere token — los datos son públicos.
 */
export function useTramites() {
  const { data, error, isLoading, mutate } = useSWR<Tramite[]>(
    "/tramites",
    makeFetcher<Tramite[]>(),
    { revalidateOnFocus: false }
  );

  return {
    tramites:  data ?? [],
    isLoading,
    error: error as Error | undefined,
    mutate,
  };
}

/* ── useTramite ──────────────────────────────────────────────────────────── */
/**
 * Detalle de un trámite por ID.
 * Pasa null como key para suspender la llamada cuando no hay id.
 */
export function useTramite(id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Tramite>(
    id ? `/tramites/${id}` : null,
    makeFetcher<Tramite>(),
    { revalidateOnFocus: false }
  );

  return {
    tramite:   data ?? null,
    isLoading,
    error: error as Error | undefined,
    mutate,
  };
}

/* ── useDocumentos ───────────────────────────────────────────────────────── */
export interface UserDocumento {
  id: string;
  tipo: string;
  nombre: string;
  tieneDocumento: boolean;
}

/**
 * Documentos del catálogo con flag tieneDocumento del usuario autenticado.
 * GET /documentos — requiere token
 */
export function useDocumentos() {
  const { data: session, status } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (session?.user as any)?.apiToken as string | undefined;

  const key: [string, string] | null =
    status === "authenticated" && token
      ? ["/documentos", token]
      : null;

  const { data, error, isLoading, mutate } = useSWR<UserDocumento[]>(
    key,
    makeTupleFetcher<UserDocumento[]>(),
    { revalidateOnFocus: true }
  );

  return {
    documentos: data ?? [],
    isLoading:  status === "loading" || isLoading,
    error: error as Error | undefined,
    mutate,
  };
}

