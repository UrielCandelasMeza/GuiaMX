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

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_MS = 1500; // primer reintento a los 1.5 s

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

  // Refs para reconexión — no necesitan disparar re-renders
  const intentionalClose = useRef(false); // true cuando el cleanup del effect cierra el WS
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) return;

    const WS_BASE =
      process.env.NEXT_PUBLIC_WS_URL ??
      (typeof window !== "undefined"
        ? `ws://${window.location.hostname}:8000`
        : "ws://localhost:8000");

    const url = `${WS_BASE}/ws?token=${encodeURIComponent(token)}`;

    function connect() {
      intentionalClose.current = false;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0; // reset al conectar exitosamente
      };

      ws.onclose = (event: CloseEvent) => {
        setIsConnected(false);
        setIsLoading(false);

        // Código 4003: usuario no existe en BD → forzar logout
        if (event.code === 4003) {
          toast.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
          signOut({ callbackUrl: "/login" });
          return;
        }

        // Código 4001: token inválido → forzar logout
        if (event.code === 4001) {
          toast.error("Token inválido. Por favor, inicia sesión de nuevo.");
          signOut({ callbackUrl: "/login" });
          return;
        }

        // Si fue intencional (cleanup del effect) → no reconectar, no mostrar toast
        if (intentionalClose.current) return;

        // Desconexión inesperada → reconectar con backoff exponencial
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_BASE_MS * 2 ** reconnectAttempts.current;
          reconnectAttempts.current += 1;
          reconnectTimer.current = setTimeout(connect, delay);
        } else {
          // Agotamos los reintentos → informar al usuario
          toast.error(
            "No se pudo reconectar con el asistente. Recarga la página.",
          );
        }
      };

      // onerror siempre dispara ANTES de onclose — no tiene info útil extra
      // (los navegadores ocultan detalles WS por seguridad).
      // Delegamos todo el manejo a onclose para evitar toasts duplicados.
      ws.onerror = () => {
        // Solo actualizamos estado; onclose manejará el toast y la reconexión.
        setIsConnected(false);
        setIsLoading(false);
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
    }

    connect();

    return () => {
      // Marcar como cierre intencional para suprimir reconexión y toast
      intentionalClose.current = true;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      wsRef.current?.close();
    };
  }, [token]);

  /* ── sendMessage ─────────────────────────────────────────────────────── */
  const sendMessage = useCallback(
    (prompt: string) => {
      const trimmed = prompt.trim();
      if (
        !trimmed ||
        !wsRef.current ||
        wsRef.current.readyState !== WebSocket.OPEN
      )
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
