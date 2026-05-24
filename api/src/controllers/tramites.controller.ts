import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/**
 * GET /tramites
 * Lista todos los trámites activos con sus documentos previos requeridos y conteo de pasos.
 */
export const listarTramites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const tramites = await prisma.tramite.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: {
        documentosPrevios: {
          include: {
            tipoDocumento: { select: { id: true, tipo: true, nombre: true } },
          },
        },
        _count: { select: { pasos: true } },
      },
    });

    res.json(
      tramites.map((t) => ({
        id: t.id,
        nombre: t.nombre,
        descripcion: t.descripcion,
        monto: t.monto,
        totalPasos: t._count.pasos,
        documentosPrevios: t.documentosPrevios.map((dp) => ({
          id: dp.tipoDocumento.id,
          tipo: dp.tipoDocumento.tipo,
          nombre: dp.tipoDocumento.nombre,
          obligatorio: dp.obligatorio,
        })),
      })),
    );
  } catch (error) {
    console.error("[TRAMITES] Error al listar trámites:", error);
    res.status(500).json({ error: "Error al obtener los trámites" });
  }
};

/**
 * GET /tramites/:id
 * Devuelve un trámite con todos sus pasos ordenados, sus dependencias y documentos requeridos por paso.
 */
export const obtenerTramite = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const tramite = await prisma.tramite.findUnique({
      where: { id },
      include: {
        documentosPrevios: {
          include: {
            tipoDocumento: { select: { id: true, tipo: true, nombre: true } },
          },
        },
        pasos: {
          where: { activo: true },
          orderBy: { orden: "asc" },
          include: {
            anteriores: {
              include: {
                anterior: { select: { id: true, orden: true, titulo: true } },
              },
            },
            siguientes: {
              include: {
                siguiente: { select: { id: true, orden: true, titulo: true } },
              },
            },
            documentosRequeridos: {
              include: {
                tipoDocumento: {
                  select: { id: true, tipo: true, nombre: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tramite) {
      res.status(404).json({ error: "Trámite no encontrado" });
      return;
    }

    res.json({
      id: tramite.id,
      nombre: tramite.nombre,
      descripcion: tramite.descripcion,
      monto: tramite.monto,
      documentosPrevios: tramite.documentosPrevios.map((dp) => ({
        id: dp.tipoDocumento.id,
        tipo: dp.tipoDocumento.tipo,
        nombre: dp.tipoDocumento.nombre,
        obligatorio: dp.obligatorio,
      })),
      pasos: tramite.pasos.map((paso) => ({
        id: paso.id,
        orden: paso.orden,
        titulo: paso.titulo,
        descripcionCorta: paso.descripcionCorta,
        descripcionLarga: paso.descripcionLarga,
        anteriores: paso.anteriores.map((dep) => ({
          id: dep.anterior.id,
          orden: dep.anterior.orden,
          titulo: dep.anterior.titulo,
        })),
        siguientes: paso.siguientes.map((dep) => ({
          id: dep.siguiente.id,
          orden: dep.siguiente.orden,
          titulo: dep.siguiente.titulo,
        })),
        documentosRequeridos: paso.documentosRequeridos.map((pd) => ({
          id: pd.tipoDocumento.id,
          tipo: pd.tipoDocumento.tipo,
          nombre: pd.tipoDocumento.nombre,
          obligatorio: pd.obligatorio,
        })),
      })),
    });
  } catch (error) {
    console.error("[TRAMITES] Error al obtener trámite:", error);
    res.status(500).json({ error: "Error al obtener el trámite" });
  }
};

/**
 * POST /tramites/:id/iniciar
 * Inicia un trámite para el usuario autenticado:
 * crea TramiteUsuario + un TramiteUsuarioPaso por cada paso del trámite.
 */
export const iniciarTramite = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: tramiteId } = req.params;

    const tramite = await prisma.tramite.findUnique({
      where: { id: tramiteId, activo: true },
      include: { pasos: { where: { activo: true }, select: { id: true } } },
    });

    if (!tramite) {
      res.status(404).json({ error: "Trámite no encontrado o inactivo" });
      return;
    }

    // Verificar si el usuario ya lo inició
    const yaIniciado = await prisma.tramiteUsuario.findFirst({
      where: {
        userId,
        tramiteId,
        estado: { in: ["PENDIENTE", "EN_PROGRESO"] },
      },
    });

    if (yaIniciado) {
      res
        .status(409)
        .json({ error: "Ya tienes este trámite iniciado", tramiteUsuarioId: yaIniciado.id });
      return;
    }

    // Crear TramiteUsuario y todos sus pasos en una transacción
    const tramiteUsuario = await prisma.$transaction(async (tx) => {
      const tu = await tx.tramiteUsuario.create({
        data: { userId, tramiteId, estado: "PENDIENTE" },
      });

      await tx.tramiteUsuarioPaso.createMany({
        data: tramite.pasos.map((paso) => ({
          tramiteUsuarioId: tu.id,
          pasoId: paso.id,
          estado: "PENDIENTE" as const,
        })),
      });

      return tu;
    });

    res.status(201).json({
      tramiteUsuarioId: tramiteUsuario.id,
      tramiteId,
      estado: tramiteUsuario.estado,
      iniciadoEn: tramiteUsuario.iniciadoEn,
    });
  } catch (error) {
    console.error("[TRAMITES] Error al iniciar trámite:", error);
    res.status(500).json({ error: "Error al iniciar el trámite" });
  }
};

/**
 * GET /tramites/mis-tramites
 * Devuelve todos los trámites iniciados por el usuario autenticado con el estado de cada paso.
 */
export const obtenerMisTramites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const misTramites = await prisma.tramiteUsuario.findMany({
      where: { userId },
      orderBy: { iniciadoEn: "desc" },
      include: {
        tramite: {
          select: { id: true, nombre: true, descripcion: true, monto: true },
        },
        pasos: {
          include: {
            paso: {
              select: {
                id: true,
                orden: true,
                titulo: true,
                descripcionCorta: true,
              },
            },
          },
          orderBy: { paso: { orden: "asc" } },
        },
      },
    });

    res.json(
      misTramites.map((tu) => ({
        id: tu.id,
        estado: tu.estado,
        iniciadoEn: tu.iniciadoEn,
        completadoEn: tu.completadoEn,
        tramite: tu.tramite,
        pasos: tu.pasos.map((p) => ({
          pasoId: p.pasoId,
          orden: p.paso.orden,
          titulo: p.paso.titulo,
          descripcionCorta: p.paso.descripcionCorta,
          estado: p.estado,
          completadoEn: p.completadoEn,
        })),
      })),
    );
  } catch (error) {
    console.error("[TRAMITES] Error al obtener mis trámites:", error);
    res.status(500).json({ error: "Error al obtener tus trámites" });
  }
};

/**
 * PATCH /tramites/mis-tramites/:tramiteUsuarioId/pasos/:pasoId
 * Actualiza el estado de un paso dentro de un trámite del usuario.
 * Valida que los pasos anteriores estén COMPLETADOS antes de avanzar.
 */
export const actualizarEstadoPaso = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { tramiteUsuarioId, pasoId } = req.params;
    const { estado } = req.body as { estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "OMITIDO" };

    const estadosValidos = ["PENDIENTE", "EN_PROGRESO", "COMPLETADO", "OMITIDO"];
    if (!estado || !estadosValidos.includes(estado)) {
      res.status(400).json({ error: `Estado inválido. Valores permitidos: ${estadosValidos.join(", ")}` });
      return;
    }

    // Verificar que el TramiteUsuario pertenece al usuario
    const tramiteUsuario = await prisma.tramiteUsuario.findUnique({
      where: { id: tramiteUsuarioId },
    });

    if (!tramiteUsuario || tramiteUsuario.userId !== userId) {
      res.status(404).json({ error: "Trámite no encontrado" });
      return;
    }

    // Verificar que el TramiteUsuarioPaso existe
    const tupaso = await prisma.tramiteUsuarioPaso.findUnique({
      where: { tramiteUsuarioId_pasoId: { tramiteUsuarioId, pasoId } },
      include: {
        paso: {
          include: {
            anteriores: {
              include: { anterior: { select: { id: true } } },
            },
          },
        },
      },
    });

    if (!tupaso) {
      res.status(404).json({ error: "Paso no encontrado en este trámite" });
      return;
    }

    // Si se quiere COMPLETAR, verificar que los pasos anteriores ya estén COMPLETADOS
    if (estado === "COMPLETADO") {
      const idsPasosAnteriores = tupaso.paso.anteriores.map(
        (dep) => dep.anterior.id,
      );

      if (idsPasosAnteriores.length > 0) {
        const pasosAnteriores = await prisma.tramiteUsuarioPaso.findMany({
          where: {
            tramiteUsuarioId,
            pasoId: { in: idsPasosAnteriores },
          },
        });

        const hayPasosPendientes = pasosAnteriores.some(
          (p) => p.estado !== "COMPLETADO" && p.estado !== "OMITIDO",
        );

        if (hayPasosPendientes) {
          res.status(422).json({
            error: "Debes completar los pasos anteriores antes de avanzar",
          });
          return;
        }
      }
    }

    // Actualizar el estado del paso
    const pasoActualizado = await prisma.tramiteUsuarioPaso.update({
      where: { tramiteUsuarioId_pasoId: { tramiteUsuarioId, pasoId } },
      data: {
        estado,
        completadoEn: estado === "COMPLETADO" ? new Date() : undefined,
      },
    });

    // Si todos los pasos están COMPLETADOS u OMITIDOS, actualizar el TramiteUsuario a COMPLETADO
    const todosPasos = await prisma.tramiteUsuarioPaso.findMany({
      where: { tramiteUsuarioId },
    });

    const tramiteCompletado = todosPasos.every(
      (p) => p.estado === "COMPLETADO" || p.estado === "OMITIDO",
    );

    if (tramiteCompletado) {
      await prisma.tramiteUsuario.update({
        where: { id: tramiteUsuarioId },
        data: { estado: "COMPLETADO", completadoEn: new Date() },
      });
    } else if (todosPasos.some((p) => p.estado === "EN_PROGRESO" || p.estado === "COMPLETADO")) {
      await prisma.tramiteUsuario.update({
        where: { id: tramiteUsuarioId },
        data: { estado: "EN_PROGRESO" },
      });
    }

    res.json({
      pasoId: pasoActualizado.pasoId,
      estado: pasoActualizado.estado,
      completadoEn: pasoActualizado.completadoEn,
      tramiteCompletado,
    });
  } catch (error) {
    console.error("[TRAMITES] Error al actualizar paso:", error);
    res.status(500).json({ error: "Error al actualizar el paso" });
  }
};
