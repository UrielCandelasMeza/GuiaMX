import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generarResumen } from "../services/resumen.service";

/**
 * GET /sesiones/resumen
 * Devuelve el resumen de la sesión más reciente del usuario que lo tenga.
 */
export const obtenerResumenUltimaSesion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const sesion = await prisma.session.findFirst({
      where: {
        userId,
        resumen: { not: null },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        resumen: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    if (!sesion) {
      res
        .status(404)
        .json({ error: "No hay sesiones con resumen para este usuario" });
      return;
    }

    res.json(sesion);
  } catch (error) {
    console.error("[SESIONES] Error al obtener resumen:", error);
    res.status(500).json({ error: "Error al obtener el resumen" });
  }
};

/**
 * POST /sesiones/cerrar
 * - Obtiene todos los ChatMessages de la sesión actual
 * - Genera un resumen con el LLM
 * - Guarda el resumen en la Session y la marca como expirada
 */
export const cerrarSesion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.replace("Bearer ", "");

    // Buscar la sesión activa por token
    const sesion = await prisma.session.findUnique({ where: { token } });

    if (!sesion || sesion.userId !== userId) {
      res.status(404).json({ error: "Sesión no encontrada" });
      return;
    }

    // Obtener todos los mensajes de la sesión (excluir SYSTEM para el resumen)
    const mensajes = await prisma.chatMessage.findMany({
      where: {
        userId,
        sessionId: sesion.id,
        rol: { in: ["USER", "ASSISTANT"] },
      },
      orderBy: { createdAt: "asc" },
      select: { rol: true, contenido: true },
    });

    // Generar el resumen con el LLM
    const resumen = await generarResumen(
      mensajes.map((m) => ({ rol: m.rol, contenido: m.contenido })),
    );

    // Guardar resumen y expirar la sesión
    await prisma.session.update({
      where: { id: sesion.id },
      data: {
        resumen,
        expiresAt: new Date(), // expirada ahora mismo
      },
    });

    res.json({ mensaje: "Sesión cerrada correctamente", resumen });
  } catch (error) {
    console.error("[SESIONES] Error al cerrar sesión:", error);
    res.status(500).json({ error: "Error al cerrar la sesión" });
  }
};
