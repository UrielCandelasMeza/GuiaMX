"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";

/* ── Types ───────────────────────────────────────────────────────────────── */
export interface Message {
  id: string;
  /** "user" | "assistant" */
  rol: "user" | "assistant";
  contenido: string;
  timestamp: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isLoading: boolean;
  messages: Message[];
  sendMessage: (prompt: string) => void;
}

/* ── Hook ────────────────────────────────────────────────────────────────── */
export function useWebSocket({ token }: { token: string }): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Obtener sessionId desde la sesión de NextAuth
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionId = (session?.user as any)?.sessionId as string | undefined;

  useEffect(() => {
    if (!token) return;

    // ws://api:8000/ws?token=JWT  (dentro de Docker)
    // ws://localhost:8000/ws?token=JWT  (local)
    const WS_BASE =
      process.env.NEXT_PUBLIC_WS_URL ??
      (typeof window !== "undefined"
        ? `ws://${window.location.hostname}:8000`
        : "ws://localhost:8000");

    const url = `${WS_BASE}/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = (event: CloseEvent) => {
      setIsConnected(false);
      setIsLoading(false);
      // Código 4003: sesión inválida — el usuario no existe en BD
      // (puede ocurrir si la BD fue recreada pero el cliente tenía un token viejo)
      if (event.code === 4003) {
        toast.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        signOut({ callbackUrl: "/login" });
      }
    };
    ws.onerror = () => {
      setIsConnected(false);
      setIsLoading(false);
      toast.error("Error de conexión con el asistente.");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as {
          type: "response" | "error" | "ping";
          content: string;
        };

        if (msg.type === "response") {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              rol: "assistant",
              contenido: msg.content,
              timestamp: Date.now(),
            },
          ]);
          setIsLoading(false);
        } else if (msg.type === "error") {
          toast.error(msg.content ?? "Error en el asistente.");
          setIsLoading(false);
        }
        // "ping" se ignora en el cliente
      } catch {
        // ignorar mensajes malformados
      }
    };

    return () => {
      ws.close();
    };
  }, [token]);

  /* ── sendMessage ─────────────────────────────────────────────────────── */
  const sendMessage = useCallback(
    (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
        return;

      // 1. Agrega el mensaje del usuario inmediatamente al UI
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        rol: "user",
        contenido: trimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // 2. Envía al backend en el formato que espera chat.ws.ts
      wsRef.current.send(
        JSON.stringify({
          type: "message",
          content: trimmed,
          sessionId: sessionId ?? "",
        }),
      );
    },
    [sessionId],
  );

  return { isConnected, isLoading, messages, sendMessage };
}

