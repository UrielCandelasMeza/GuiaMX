"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

interface UseWebSocketOptions {
  /** Socket.IO namespace/path, defaults to "/" */
  namespace?: string;
  /** Whether to connect automatically on mount */
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler?: (...args: unknown[]) => void) => void;
}

export function useWebSocket(
  opts: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const { namespace = "", autoConnect = true } = opts;
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${WS_URL}${namespace}`, {
      autoConnect,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [namespace, autoConnect]);

  const emit = useCallback((event: string, ...args: unknown[]) => {
    socketRef.current?.emit(event, ...args);
  }, []);

  const on = useCallback(
    (event: string, handler: (...args: unknown[]) => void) => {
      socketRef.current?.on(event, handler);
    },
    []
  );

  const off = useCallback(
    (event: string, handler?: (...args: unknown[]) => void) => {
      if (handler) {
        socketRef.current?.off(event, handler);
      } else {
        socketRef.current?.off(event);
      }
    },
    []
  );

  return { socket: socketRef.current, connected, emit, on, off };
}
