import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { Server } from "http";
import { URL } from "url";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { procesarMensajeLLM } from "../services/llm.service";
import type { RolMensaje } from "../../generated/prisma/enums";

// Payload de mensajes del cliente
interface ClientMessage {
  type: "message";
  content: string;
  sessionId: string;
}

// Mensajes que envía el servidor al cliente
interface ServerMessage {
  type: "response" | "error" | "ping";
  content: string;
}

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    // ── 1. Extraer y verificar token del query string ──────────────────────
    const reqUrl = new URL(req.url ?? "", `http://${req.headers.host}`);
    const token = reqUrl.searchParams.get("token");

    if (!token) {
      ws.close(4001, "Token requerido");
      return;
    }

    let userId: string;
    try {
      const payload = verifyToken(token);
      userId = payload.sub as string;
    } catch {
      ws.close(4001, "Token inválido o expirado");
      return;
    }

    // Verificar que el usuario realmente existe en BD
    // (el token puede ser válido pero la BD pudo haber sido recreada)
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) {
      ws.close(4003, "Usuario no encontrado, por favor inicia sesión de nuevo");
      return;
    }

    console.log(`[WS] Usuario conectado: ${userId}`);

    // ── 2. Ping/pong cada 30 segundos para mantener la conexión ───────────
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30_000);

    // ── 3. Manejar mensajes entrantes ──────────────────────────────────────
    ws.on("message", async (raw) => {
      let payload: ClientMessage;

      try {
        payload = JSON.parse(raw.toString()) as ClientMessage;
      } catch {
        send(ws, { type: "error", content: "Mensaje inválido: debe ser JSON" });
        return;
      }

      if (payload.type !== "message" || !payload.content?.trim()) {
        send(ws, {
          type: "error",
          content: "Tipo de mensaje inválido o contenido vacío",
        });
        return;
      }

      const { content: mensaje, sessionId } = payload;

      try {
        // Obtener los últimos 20 mensajes del historial
        const historial = await prisma.chatMessage.findMany({
          where: {
            userId,
            sessionId,
            rol: { in: ["USER", "ASSISTANT"] as RolMensaje[] },
          },
          orderBy: { createdAt: "asc" },
          take: 20,
          select: { rol: true, contenido: true },
        });

        // Procesar el mensaje con el LLM
        const respuesta = await procesarMensajeLLM({
          userId,
          sessionId,
          mensaje,
          historial: historial.map((m) => ({
            rol: m.rol,
            contenido: m.contenido,
          })),
        });

        send(ws, { type: "response", content: respuesta });
      } catch (err) {
        console.error("[WS] Error procesando mensaje:", err);
        send(ws, {
          type: "error",
          content: "Ocurrió un error al procesar tu mensaje. Intenta de nuevo.",
        });
      }
    });

    // ── 4. Limpiar al desconectar ──────────────────────────────────────────
    ws.on("close", () => {
      clearInterval(pingInterval);
      console.log(`[WS] Usuario desconectado: ${userId}`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error en conexión de ${userId}:`, err);
      clearInterval(pingInterval);
    });
  });

  console.log("[WS] WebSocket server configurado en /ws");
  return wss;
}
