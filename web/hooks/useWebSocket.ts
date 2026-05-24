"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";

/* ── Types ───────────────────────────────────────────────────────────────── */
export interface Message {
  id: string;
  /** "user" | "assistant" */
  rol: "user" | "assistant";
  contenido: string;
  timestamp: number;
}

interface SendContext {
  tramiteId?: string;
  pasoId?: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isLoading: boolean;
  messages: Message[];
  sendMessage: (prompt: string, context?: SendContext) => void;
}

/* ── Hook ────────────────────────────────────────────────────────────────── */
export function useWebSocket({ token }: { token: string }): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [messages, setMessages]       = useState<Message[]>([]);

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

    const socket = io(WS_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    /* ── Conexión ── */
    socket.on("connect",    () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    /* ── Streaming chunk ── */
    socket.on("chunk", (texto: string) => {
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        // Acumula en el último mensaje del asistente
        if (last && last.rol === "assistant") {
          copy[copy.length - 1] = { ...last, contenido: last.contenido + texto };
        } else {
          // Primer chunk — crea el mensaje del asistente
          copy.push({
            id:        `assistant-${Date.now()}`,
            rol:       "assistant",
            contenido: texto,
            timestamp: Date.now(),
          });
        }
        return copy;
      });
    });

    /* ── Fin del stream ── */
    socket.on("fin", () => setIsLoading(false));

    /* ── Error ── */
    socket.on("error", (msg?: string) => {
      toast.error(msg ?? "Error en el asistente. Inténtalo de nuevo.");
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
    };
    // token solo cambia en re-login; intencionalmente incluido
  }, [token]);

  /* ── sendMessage ─────────────────────────────────────────────────────── */
  const sendMessage = useCallback(
    (prompt: string, context?: SendContext) => {
      const trimmed = prompt.trim();
      if (!trimmed || !socketRef.current) return;

      // 1. Agrega mensaje del usuario inmediatamente
      const userMsg: Message = {
        id:        `user-${Date.now()}`,
        rol:       "user",
        contenido: trimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // 2. Emite evento al servidor
      socketRef.current.emit("mensaje", { prompt: trimmed, ...context });

      // 3. Activa loading
      setIsLoading(true);
    },
    []
  );

  return { isConnected, isLoading, messages, sendMessage };
}
