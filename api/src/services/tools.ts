import { prisma } from "../lib/prisma";
import type { TipoDocumentoEnum } from "../../generated/prisma/enums";

// ── Definiciones de tools para el OpenAI SDK ─────────────────────────────────

export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    name: "obtener_documentos_usuario",
    description:
      "Consulta los documentos que tiene registrados el usuario en su perfil",
    parameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "ID del usuario",
        },
      },
      required: ["userId"],
    },
  },
  {
    type: "function" as const,
    name: "agregar_documento_usuario",
    description:
      "Registra que el usuario posee un documento. Úsalo cuando el usuario mencione que tiene un documento.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID del usuario" },
        tipoDocumento: {
          type: "string",
          enum: [
            "CURP", "LLAVE_MX", "ACTA_NACIMIENTO", "EFIRMA", "INE",
            "PASAPORTE", "CARTILLA_MILITAR", "COMPROBANTE_DOMICILIO",
            "LLAVE_CDMX", "CORREO_PERSONAL", "CERTIFICACION_ACADEMICA",
            "NUMERO_TELEFONO", "NSS", "RFC", "LICENCIA_VEHICULAR_PLACA",
            "IDENTIFICACION_SECUNDARIA",
          ],
          description: "Tipo de documento a agregar",
        },
      },
      required: ["userId", "tipoDocumento"],
    },
  },
  {
    type: "function" as const,
    name: "eliminar_documento_usuario",
    description:
      "Elimina un documento del perfil del usuario. Úsalo cuando el usuario indique que ya no tiene o quiere quitar un documento.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID del usuario" },
        tipoDocumento: {
          type: "string",
          enum: [
            "CURP", "LLAVE_MX", "ACTA_NACIMIENTO", "EFIRMA", "INE",
            "PASAPORTE", "CARTILLA_MILITAR", "COMPROBANTE_DOMICILIO",
            "LLAVE_CDMX", "CORREO_PERSONAL", "CERTIFICACION_ACADEMICA",
            "NUMERO_TELEFONO", "NSS", "RFC", "LICENCIA_VEHICULAR_PLACA",
            "IDENTIFICACION_SECUNDARIA",
          ],
          description: "Tipo de documento a eliminar",
        },
      },
      required: ["userId", "tipoDocumento"],
    },
  },
  {
    type: "function" as const,
    name: "buscar_tramites",
    description: "Busca trámites disponibles en el sistema, opcionalmente filtrando por nombre",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Término de búsqueda opcional para filtrar trámites por nombre",
        },
      },
      required: [],
    },
  },
  {
    type: "function" as const,
    name: "obtener_detalle_tramite",
    description:
      "Obtiene los pasos, documentos requeridos y documentos previos de un trámite específico",
    parameters: {
      type: "object",
      properties: {
        tramiteId: {
          type: "string",
          description: "ID del trámite en la base de datos",
        },
      },
      required: ["tramiteId"],
    },
  },
  {
    type: "function" as const,
    name: "iniciar_tramite_usuario",
    description:
      "Inicia un trámite para el usuario. Crea el registro de seguimiento y todos sus pasos.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID del usuario" },
        tramiteId: { type: "string", description: "ID del trámite a iniciar" },
      },
      required: ["userId", "tramiteId"],
    },
  },
  {
    type: "function" as const,
    name: "obtener_tramites_usuario",
    description: "Consulta los trámites activos e historial del usuario",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID del usuario" },
      },
      required: ["userId"],
    },
  },
] as const;

// ── Implementaciones ──────────────────────────────────────────────────────────

export async function ejecutarTool(
  nombre: string,
  args: Record<string, string>,
): Promise<unknown> {
  switch (nombre) {
    case "obtener_documentos_usuario": {
      const docs = await prisma.userDocumento.findMany({
        where: { userId: args.userId },
        include: { tipoDocumento: true },
      });
      return docs.map((d) => ({
        tipo: d.tipoDocumento.tipo,
        nombre: d.tipoDocumento.nombre,
        verificado: d.verificado,
      }));
    }

    case "agregar_documento_usuario": {
      const tipo = await prisma.tipoDocumento.findUnique({
        where: { tipo: args.tipoDocumento as TipoDocumentoEnum },
      });
      if (!tipo) return { error: `Tipo de documento desconocido: ${args.tipoDocumento}` };

      const existente = await prisma.userDocumento.findUnique({
        where: {
          userId_tipoDocumentoId: {
            userId: args.userId,
            tipoDocumentoId: tipo.id,
          },
        },
      });
      if (existente) return { mensaje: `El usuario ya tiene registrado: ${args.tipoDocumento}` };

      await prisma.userDocumento.create({
        data: { userId: args.userId, tipoDocumentoId: tipo.id, verificado: true },
      });
      return { mensaje: `Documento ${args.tipoDocumento} agregado correctamente` };
    }

    case "eliminar_documento_usuario": {
      const tipo = await prisma.tipoDocumento.findUnique({
        where: { tipo: args.tipoDocumento as TipoDocumentoEnum },
      });
      if (!tipo) return { error: `Tipo de documento desconocido: ${args.tipoDocumento}` };

      await prisma.userDocumento.deleteMany({
        where: { userId: args.userId, tipoDocumentoId: tipo.id },
      });
      return { mensaje: `Documento ${args.tipoDocumento} eliminado correctamente` };
    }

    case "buscar_tramites": {
      const tramites = await prisma.tramite.findMany({
        where: {
          activo: true,
          ...(args.query
            ? { nombre: { contains: args.query, mode: "insensitive" } }
            : {}),
        },
        select: { id: true, nombre: true, descripcion: true, monto: true },
        orderBy: { nombre: "asc" },
      });
      return tramites;
    }

    case "obtener_detalle_tramite": {
      const tramite = await prisma.tramite.findUnique({
        where: { id: args.tramiteId },
        include: {
          documentosPrevios: {
            include: { tipoDocumento: { select: { tipo: true, nombre: true } } },
          },
          pasos: {
            where: { activo: true },
            orderBy: { orden: "asc" },
            include: {
              documentosRequeridos: {
                include: { tipoDocumento: { select: { tipo: true, nombre: true } } },
              },
            },
          },
        },
      });
      if (!tramite) return { error: "Trámite no encontrado" };
      return tramite;
    }

    case "iniciar_tramite_usuario": {
      const tramite = await prisma.tramite.findUnique({
        where: { id: args.tramiteId, activo: true },
        include: { pasos: { where: { activo: true }, select: { id: true } } },
      });
      if (!tramite) return { error: "Trámite no encontrado o inactivo" };

      const yaIniciado = await prisma.tramiteUsuario.findFirst({
        where: { userId: args.userId, tramiteId: args.tramiteId, estado: { in: ["PENDIENTE", "EN_PROGRESO"] } },
      });
      if (yaIniciado) return { mensaje: "El usuario ya tiene este trámite iniciado", tramiteUsuarioId: yaIniciado.id };

      const tu = await prisma.$transaction(async (tx) => {
        const tramiteUsuario = await tx.tramiteUsuario.create({
          data: { userId: args.userId, tramiteId: args.tramiteId, estado: "PENDIENTE" },
        });
        await tx.tramiteUsuarioPaso.createMany({
          data: tramite.pasos.map((p) => ({
            tramiteUsuarioId: tramiteUsuario.id,
            pasoId: p.id,
            estado: "PENDIENTE" as const,
          })),
        });
        return tramiteUsuario;
      }, { maxWait: 10000, timeout: 30000 });

      return { mensaje: `Trámite "${tramite.nombre}" iniciado correctamente`, tramiteUsuarioId: tu.id };
    }

    case "obtener_tramites_usuario": {
      const tramites = await prisma.tramiteUsuario.findMany({
        where: { userId: args.userId },
        orderBy: { iniciadoEn: "desc" },
        include: {
          tramite: { select: { nombre: true, descripcion: true } },
          pasos: {
            include: { paso: { select: { orden: true, titulo: true } } },
            orderBy: { paso: { orden: "asc" } },
          },
        },
      });
      return tramites.map((tu) => ({
        id: tu.id,
        tramite: tu.tramite.nombre,
        estado: tu.estado,
        iniciadoEn: tu.iniciadoEn,
        pasos: tu.pasos.map((p) => ({
          orden: p.paso.orden,
          titulo: p.paso.titulo,
          estado: p.estado,
        })),
      }));
    }

    default:
      return { error: `Función desconocida: ${nombre}` };
  }
}
