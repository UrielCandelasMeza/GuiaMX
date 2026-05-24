import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/**
 * GET /documentos
 * Devuelve todos los tipos de documento del sistema con un flag
 * `tieneDocumento: true/false` indicando si el usuario autenticado lo posee.
 */
export const obtenerDocumentosUsuario = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [todosLosTipos, documentosDelUsuario] = await Promise.all([
      prisma.tipoDocumento.findMany({
        orderBy: { nombre: "asc" },
      }),
      prisma.userDocumento.findMany({
        where: { userId },
        select: { tipoDocumentoId: true },
      }),
    ]);

    const idsQueElUsuarioTiene = new Set(
      documentosDelUsuario.map((d) => d.tipoDocumentoId),
    );

    const resultado = todosLosTipos.map((tipo) => ({
      id: tipo.id,
      tipo: tipo.tipo,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      obligatorio: tipo.obligatorio,
      tieneDocumento: idsQueElUsuarioTiene.has(tipo.id),
    }));

    res.json(resultado);
  } catch (error) {
    console.error("[DOCUMENTOS] Error al obtener documentos:", error);
    res.status(500).json({ error: "Error al obtener los documentos" });
  }
};

/**
 * POST /documentos/toggle/:tipoDocumentoId
 * Si el usuario NO tiene el documento → lo registra (checked).
 * Si el usuario YA lo tiene → lo elimina (unchecked).
 * Devuelve el nuevo estado: { tieneDocumento: boolean }
 */
export const toggleDocumento = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { tipoDocumentoId } = req.params;

    // Verificar que el tipo de documento existe
    const tipoDocumento = await prisma.tipoDocumento.findUnique({
      where: { id: tipoDocumentoId },
    });

    if (!tipoDocumento) {
      res.status(404).json({ error: "Tipo de documento no encontrado" });
      return;
    }

    // Buscar si ya existe la relación
    const existente = await prisma.userDocumento.findUnique({
      where: {
        userId_tipoDocumentoId: { userId, tipoDocumentoId },
      },
    });

    if (existente) {
      // Ya lo tiene → quitar (uncheck)
      await prisma.userDocumento.delete({ where: { id: existente.id } });
      res.json({ tieneDocumento: false, tipo: tipoDocumento.tipo, nombre: tipoDocumento.nombre });
    } else {
      // No lo tiene → agregar (check)
      await prisma.userDocumento.create({
        data: { userId, tipoDocumentoId, verificado: true },
      });
      res.json({ tieneDocumento: true, tipo: tipoDocumento.tipo, nombre: tipoDocumento.nombre });
    }
  } catch (error) {
    console.error("[DOCUMENTOS] Error en toggle:", error);
    res.status(500).json({ error: "Error al actualizar el documento" });
  }
};
