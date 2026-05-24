import { prisma } from "../lib/prisma";

/**
 * Arma el contexto completo del usuario para inyectarlo en el system prompt del LLM.
 * Incluye: datos personales, documentos que posee/le faltan, trámites activos con pasos,
 * y el resumen de la última sesión.
 */
export async function armarContextoUsuario(userId: string): Promise<string> {
  // ── 1. Datos del usuario ──────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { nombre: true, apellidos: true, correo: true },
  });

  if (!user) {
    return "=== CONTEXTO DEL USUARIO ===\nUsuario no encontrado.\n=== FIN DEL CONTEXTO ===";
  }

  // ── 2. Documentos que posee el usuario ───────────────────────────────────
  const documentosUsuario = await prisma.userDocumento.findMany({
    where: { userId },
    include: {
      tipoDocumento: { select: { nombre: true } },
    },
  });

  const idsDocumentosUsuario = new Set(
    documentosUsuario.map((d) => d.tipoDocumentoId)
  );

  // ── 3. Todos los tipos de documento (para calcular los que faltan) ────────
  const todosTipos = await prisma.tipoDocumento.findMany({
    select: { id: true, nombre: true },
  });

  const documentosFaltantes = todosTipos.filter(
    (t) => !idsDocumentosUsuario.has(t.id)
  );

  // ── 4. Trámites activos (PENDIENTE o EN_PROGRESO) con sus pasos ──────────
  const tramitesActivos = await prisma.tramiteUsuario.findMany({
    where: {
      userId,
      estado: { in: ["PENDIENTE", "EN_PROGRESO"] },
    },
    include: {
      tramite: { select: { nombre: true } },
      pasos: {
        include: {
          paso: { select: { id: true, orden: true, titulo: true } },
        },
        orderBy: { paso: { orden: "asc" } },
      },
    },
  });

  // ── 5. Resumen de la última sesión ───────────────────────────────────────
  const ultimaSesion = await prisma.session.findFirst({
    where: { userId, resumen: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { resumen: true },
  });

  // ── Construir el string de contexto ─────────────────────────────────────
  const lineas: string[] = [];

  lineas.push("=== CONTEXTO DEL USUARIO ===");
  lineas.push(`Nombre: ${user.nombre} ${user.apellidos}`);
  lineas.push(`Correo: ${user.correo}`);

  // Documentos que posee
  lineas.push("\n--- Documentos que posee ---");
  if (documentosUsuario.length === 0) {
    lineas.push("(ninguno registrado)");
  } else {
    for (const doc of documentosUsuario) {
      const estado = doc.verificado ? "verificado" : "no verificado";
      lineas.push(`✅ ${doc.tipoDocumento.nombre} (${estado})`);
    }
  }

  // Documentos que le faltan
  lineas.push("\n--- Documentos que le faltan ---");
  if (documentosFaltantes.length === 0) {
    lineas.push("(tiene todos los documentos registrados)");
  } else {
    for (const tipo of documentosFaltantes) {
      lineas.push(`❌ ${tipo.nombre}`);
    }
  }

  // Trámites activos — incluye IDs necesarios para actualizar_estado_paso
  lineas.push("\n--- Trámites activos ---");
  if (tramitesActivos.length === 0) {
    lineas.push("(sin trámites activos)");
  } else {
    for (const tu of tramitesActivos) {
      lineas.push(`📋 Trámite: ${tu.tramite.nombre} | Estado: ${tu.estado} | tramiteUsuarioId: ${tu.id}`);
      for (const tp of tu.pasos) {
        const icono =
          tp.estado === "COMPLETADO"
            ? "✅"
            : tp.estado === "EN_PROGRESO"
              ? "⏳"
              : tp.estado === "OMITIDO"
                ? "⏭️"
                : "⬜";
        lineas.push(
          `   Paso ${tp.paso.orden}: ${tp.paso.titulo} ${icono} | pasoId: ${tp.pasoId}`
        );
      }
    }
  }

  // Resumen de la última sesión
  lineas.push("\n--- Resumen de la última sesión ---");
  lineas.push(ultimaSesion?.resumen ?? "Sin sesiones previas");

  lineas.push("=== FIN DEL CONTEXTO ===");

  return lineas.join("\n");
}
