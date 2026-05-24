/**
 * seed-tramite.ts
 * ─────────────────────────────────────────────────────────────
 * Script Bun para ingestar un JSON de trámite en la base de
 * datos Prisma. Soporta cualquier variación de pasos,
 * documentos y dependencias.
 *
 * Uso:
 *   bun run seed-tramite.ts ./tramite_curp.json
 *   bun run seed-tramite.ts ./tramite_curp.json --dry-run
 *   bun run seed-tramite.ts ./tramite_curp.json --upsert
 *
 * Flags:
 *   --dry-run   Valida y muestra lo que se insertaría, sin tocar la DB
 *   --upsert    Si el trámite ya existe (mismo nombre), lo actualiza
 *               en lugar de fallar
 * ─────────────────────────────────────────────────────────────
 */

import { prisma, prisma } from '../src/lib/prisma';
import {type TipoDocumentoEnum} from '../generated/prisma/enums'
import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Tipos del JSON de entrada ────────────────────────────────────────────────

/**
 * Representa un documento requerido dentro del JSON.
 * El campo `tipoDocumento` debe ser un valor del enum
 * TipoDocumentoEnum definido en el schema Prisma.
 */
interface JsonDocumentoRequerido {
  tipoDocumento: string; // Valor del enum, ej: "CURP", "INE"
  obligatorio?: boolean;
  nota?: string;
}

/**
 * Representa un paso dentro del JSON del trámite.
 * Las dependencias se expresan como arrays de IDs locales
 * (los "id" string definidos en el propio JSON, no UUIDs de DB).
 */
interface JsonPaso {
  id: string;               // ID local del JSON, ej: "paso-1"
  orden: number;
  titulo: string;
  descripcionCorta: string;
  descripcionLarga?: string;
  activo?: boolean;
  condicion?: string;       // Campo informativo, se guarda en descripcionLarga
  documentosRequeridos?: JsonDocumentoRequerido[];
  dependencias?: {
    anteriores?: string[];  // IDs locales de pasos anteriores
    siguientes?: string[];  // IDs locales de pasos siguientes
  };
  // Campos adicionales del JSON que se ignoran (salidaDocumento, campos, etc.)
  [key: string]: unknown;
}

/**
 * Estructura raíz del JSON de trámite.
 */
interface JsonTramite {
  tramite: {
    id?: string;            // ID local opcional, no se usa como PK en DB
    nombre: string;
    descripcion: string;
    monto?: number;
    activo?: boolean;
    documentosPrevios?: JsonDocumentoRequerido[];
    pasos: JsonPaso[];
    // Campos extra que se ignoran (estadosFlujo, estadosPaso, etc.)
    [key: string]: unknown;
  };
}

// ─── Validación del enum TipoDocumentoEnum ────────────────────────────────────

const TIPOS_DOCUMENTO_VALIDOS = new Set<string>([
  "CURP", "LLAVE_MX", "ACTA_NACIMIENTO", "EFIRMA", "INE", "PASAPORTE",
  "CARTILLA_MILITAR", "COMPROBANTE_DOMICILIO", "LLAVE_CDMX", "CORREO_PERSONAL",
  "CERTIFICACION_ACADEMICA", "NUMERO_TELEFONO", "NSS", "RFC",
  "LICENCIA_VEHICULAR_PLACA", "IDENTIFICACION_SECUNDARIA",
]);

function esTipoDocumentoValido(tipo: string): tipo is TipoDocumentoEnum {
  return TIPOS_DOCUMENTO_VALIDOS.has(tipo);
}

// ─── Validación del JSON de entrada ──────────────────────────────────────────

interface ErrorValidacion {
  campo: string;
  mensaje: string;
}

function validarJsonTramite(raw: unknown): {
  valido: boolean;
  errores: ErrorValidacion[];
  datos?: JsonTramite;
} {
  const errores: ErrorValidacion[] = [];

  if (typeof raw !== "object" || raw === null) {
    return { valido: false, errores: [{ campo: "root", mensaje: "El JSON debe ser un objeto" }] };
  }

  const obj = raw as Record<string, unknown>;

  if (!obj.tramite || typeof obj.tramite !== "object") {
    errores.push({ campo: "tramite", mensaje: "Campo 'tramite' requerido y debe ser un objeto" });
    return { valido: false, errores };
  }

  const t = obj.tramite as Record<string, unknown>;

  // Validar campos obligatorios del trámite
  if (!t.nombre || typeof t.nombre !== "string") {
    errores.push({ campo: "tramite.nombre", mensaje: "Campo 'nombre' requerido (string)" });
  }
  if (!t.descripcion || typeof t.descripcion !== "string") {
    errores.push({ campo: "tramite.descripcion", mensaje: "Campo 'descripcion' requerido (string)" });
  }
  if (!Array.isArray(t.pasos) || t.pasos.length === 0) {
    errores.push({ campo: "tramite.pasos", mensaje: "Se requiere al menos un paso en el array 'pasos'" });
    return { valido: false, errores };
  }

  // Validar documentosPrevios
  if (t.documentosPrevios !== undefined) {
    if (!Array.isArray(t.documentosPrevios)) {
      errores.push({ campo: "tramite.documentosPrevios", mensaje: "Debe ser un array" });
    } else {
      (t.documentosPrevios as unknown[]).forEach((d, i) => {
        const doc = d as Record<string, unknown>;
        if (!doc.tipoDocumento || typeof doc.tipoDocumento !== "string") {
          errores.push({ campo: `tramite.documentosPrevios[${i}].tipoDocumento`, mensaje: "Requerido (string)" });
        } else if (!esTipoDocumentoValido(doc.tipoDocumento)) {
          errores.push({
            campo: `tramite.documentosPrevios[${i}].tipoDocumento`,
            mensaje: `Valor inválido: '${doc.tipoDocumento}'. Debe ser uno de: ${[...TIPOS_DOCUMENTO_VALIDOS].join(", ")}`,
          });
        }
      });
    }
  }

  // Validar pasos
  const idsLocales = new Set<string>();

  (t.pasos as unknown[]).forEach((p, i) => {
    const paso = p as Record<string, unknown>;
    const prefix = `tramite.pasos[${i}]`;

    if (!paso.id || typeof paso.id !== "string") {
      errores.push({ campo: `${prefix}.id`, mensaje: "Requerido (string)" });
    } else {
      if (idsLocales.has(paso.id)) {
        errores.push({ campo: `${prefix}.id`, mensaje: `ID local duplicado: '${paso.id}'` });
      }
      idsLocales.add(paso.id as string);
    }

    if (typeof paso.orden !== "number") {
      errores.push({ campo: `${prefix}.orden`, mensaje: "Requerido (number)" });
    }
    if (!paso.titulo || typeof paso.titulo !== "string") {
      errores.push({ campo: `${prefix}.titulo`, mensaje: "Requerido (string)" });
    }
    if (!paso.descripcionCorta || typeof paso.descripcionCorta !== "string") {
      errores.push({ campo: `${prefix}.descripcionCorta`, mensaje: "Requerido (string)" });
    }

    // Validar documentosRequeridos del paso
    if (paso.documentosRequeridos !== undefined) {
      if (!Array.isArray(paso.documentosRequeridos)) {
        errores.push({ campo: `${prefix}.documentosRequeridos`, mensaje: "Debe ser un array" });
      } else {
        (paso.documentosRequeridos as unknown[]).forEach((d, j) => {
          const doc = d as Record<string, unknown>;
          if (!doc.tipoDocumento || typeof doc.tipoDocumento !== "string") {
            errores.push({ campo: `${prefix}.documentosRequeridos[${j}].tipoDocumento`, mensaje: "Requerido" });
          } else if (!esTipoDocumentoValido(doc.tipoDocumento)) {
            errores.push({
              campo: `${prefix}.documentosRequeridos[${j}].tipoDocumento`,
              mensaje: `Valor inválido: '${doc.tipoDocumento}'`,
            });
          }
        });
      }
    }
  });

  // Validar que las dependencias referencien IDs locales existentes
  (t.pasos as unknown[]).forEach((p, i) => {
    const paso = p as Record<string, unknown>;
    const prefix = `tramite.pasos[${i}].dependencias`;
    const dep = paso.dependencias as Record<string, unknown> | undefined;

    if (dep) {
      for (const dir of ["anteriores", "siguientes"] as const) {
        if (dep[dir] !== undefined) {
          if (!Array.isArray(dep[dir])) {
            errores.push({ campo: `${prefix}.${dir}`, mensaje: "Debe ser un array de strings" });
          } else {
            (dep[dir] as unknown[]).forEach((id, j) => {
              if (typeof id !== "string") {
                errores.push({ campo: `${prefix}.${dir}[${j}]`, mensaje: "Debe ser un string" });
              } else if (!idsLocales.has(id)) {
                errores.push({
                  campo: `${prefix}.${dir}[${j}]`,
                  mensaje: `ID local '${id}' no existe en tramite.pasos`,
                });
              }
            });
          }
        }
      }
    }
  });

  if (errores.length > 0) return { valido: false, errores };

  return { valido: true, errores: [], datos: raw as JsonTramite };
}

// ─── Función principal de ingesta ─────────────────────────────────────────────

async function ingestarTramite(
  prisma: PrismaClient,
  datos: JsonTramite,
  opciones: { upsert: boolean; dryRun: boolean }
): Promise<void> {
  const { tramite: t } = datos;
  const { upsert, dryRun } = opciones;

  // Recolectar todos los tipos de documentos mencionados en el JSON
  const tiposNecesarios = new Set<string>();

  for (const d of t.documentosPrevios ?? []) {
    tiposNecesarios.add(d.tipoDocumento);
  }
  for (const paso of t.pasos) {
    for (const d of paso.documentosRequeridos ?? []) {
      tiposNecesarios.add(d.tipoDocumento);
    }
  }

  console.log("\n📋 Plan de ingesta:");
  console.log(`   Trámite        : ${t.nombre}`);
  console.log(`   Pasos          : ${t.pasos.length}`);
  console.log(`   Tipos docs     : ${[...tiposNecesarios].join(", ") || "ninguno"}`);
  console.log(`   Docs previos   : ${t.documentosPrevios?.length ?? 0}`);
  console.log(`   Modo           : ${upsert ? "upsert" : "insert"}`);
  if (dryRun) {
    console.log("\n⚠️  DRY RUN — no se escribirá nada en la base de datos.\n");
    return;
  }

  // Todo en una sola transacción interactiva
  await prisma.$transaction(async (tx) => {

    // ── 1. Upsert de TipoDocumento ──────────────────────────────────────────
    console.log("\n[1/5] Sincronizando tipos de documento...");

    const tipoDocumentoMap = new Map<string, string>(); // tipo → id de DB

    for (const tipo of tiposNecesarios) {
      const td = await tx.tipoDocumento.upsert({
        where:  { tipo: tipo as TipoDocumentoEnum },
        update: {}, // Si ya existe, no se toca
        create: {
          tipo:        tipo as TipoDocumentoEnum,
          nombre:      tipo.replace(/_/g, " "),
          descripcion: `Documento de tipo ${tipo}`,
          obligatorio: false,
        },
      });
      tipoDocumentoMap.set(tipo, td.id);
      console.log(`   ✓ TipoDocumento: ${tipo} → ${td.id}`);
    }

    // ── 2. Crear o actualizar el Trámite ────────────────────────────────────
    console.log("\n[2/5] Creando trámite...");

    let tramiteDb: { id: string };

    if (upsert) {
      tramiteDb = await tx.tramite.upsert({
        where:  { nombre: t.nombre } as never, // nombre no es @unique en schema; ver nota abajo
        update: {
          descripcion: t.descripcion,
          monto:       t.monto ?? 0,
          activo:      t.activo ?? true,
        },
        create: {
          nombre:      t.nombre,
          descripcion: t.descripcion,
          monto:       t.monto ?? 0,
          activo:      t.activo ?? true,
        },
      });
    } else {
      // Verificar si ya existe para dar un error claro
      const existente = await tx.tramite.findFirst({ where: { nombre: t.nombre } });
      if (existente) {
        throw new Error(
          `El trámite '${t.nombre}' ya existe (id: ${existente.id}). ` +
          `Usa el flag --upsert para actualizarlo.`
        );
      }
      tramiteDb = await tx.tramite.create({
        data: {
          nombre:      t.nombre,
          descripcion: t.descripcion,
          monto:       t.monto ?? 0,
          activo:      t.activo ?? true,
        },
      });
    }

    console.log(`   ✓ Trámite creado/actualizado: ${tramiteDb.id}`);

    // ── 3. Documentos previos del trámite ───────────────────────────────────
    console.log("\n[3/5] Registrando documentos previos del trámite...");

    if (upsert) {
      // En upsert, limpiar los previos antes de re-crear
      await tx.tramiteDocumento.deleteMany({ where: { tramiteId: tramiteDb.id } });
    }

    for (const doc of t.documentosPrevios ?? []) {
      const tipoId = tipoDocumentoMap.get(doc.tipoDocumento)!;
      await tx.tramiteDocumento.create({
        data: {
          tramiteId:       tramiteDb.id,
          tipoDocumentoId: tipoId,
          obligatorio:     doc.obligatorio ?? true,
        },
      });
      console.log(`   ✓ Doc previo: ${doc.tipoDocumento} (obligatorio: ${doc.obligatorio ?? true})`);
    }

    // ── 4. Pasos (primera pasada: crear registros sin dependencias) ─────────
    console.log("\n[4/5] Creando pasos...");

    if (upsert) {
      // En upsert, borrar pasos existentes en cascada (elimina PasoDocumento y PasoDependencia)
      await tx.paso.deleteMany({ where: { tramiteId: tramiteDb.id } });
    }

    // Mapa: ID local del JSON → ID de DB
    const pasoIdMap = new Map<string, string>();

    for (const paso of t.pasos) {
      // Si el paso tiene condición, se añade al final de descripcionLarga
      let descLarga = paso.descripcionLarga ?? "";
      if (paso.condicion) {
        descLarga += descLarga ? `\n\nCondición de activación: ${paso.condicion}` : `Condición de activación: ${paso.condicion}`;
      }

      const pasoDb = await tx.paso.create({
        data: {
          tramiteId:        tramiteDb.id,
          orden:            paso.orden,
          titulo:           paso.titulo,
          descripcionCorta: paso.descripcionCorta,
          descripcionLarga: descLarga || null,
          activo:           paso.activo ?? true,
        },
      });

      pasoIdMap.set(paso.id, pasoDb.id);
      console.log(`   ✓ Paso [${paso.orden}] '${paso.titulo}' → ${pasoDb.id}`);

      // Documentos requeridos por el paso
      for (const doc of paso.documentosRequeridos ?? []) {
        if (!doc.tipoDocumento) continue;
        const tipoId = tipoDocumentoMap.get(doc.tipoDocumento)!;
        await tx.pasoDocumento.create({
          data: {
            pasoId:          pasoDb.id,
            tipoDocumentoId: tipoId,
            obligatorio:     doc.obligatorio ?? true,
          },
        });
        console.log(`     └─ Doc requerido: ${doc.tipoDocumento}`);
      }
    }

    // ── 5. Dependencias entre pasos (segunda pasada) ────────────────────────
    console.log("\n[5/5] Registrando dependencias entre pasos...");

    // Usamos un Set para deduplicar: el JSON puede declarar
    // la misma dependencia en ambos sentidos (siguientes y anteriores)
    const dependenciasInsertadas = new Set<string>();

    for (const paso of t.pasos) {
      const anteriorDbId = pasoIdMap.get(paso.id)!;

      // Desde la perspectiva de 'siguientes' del paso actual
      for (const siguienteLocalId of paso.dependencias?.siguientes ?? []) {
        const siguienteDbId = pasoIdMap.get(siguienteLocalId)!;
        const key = `${anteriorDbId}→${siguienteDbId}`;

        if (!dependenciasInsertadas.has(key)) {
          await tx.pasoDependencia.create({
            data: { anteriorId: anteriorDbId, siguienteId: siguienteDbId },
          });
          dependenciasInsertadas.add(key);
          console.log(`   ✓ Dependencia: ${paso.id} → ${siguienteLocalId}`);
        }
      }

      // Desde la perspectiva de 'anteriores' del paso actual
      // (declara el mismo arco pero desde el otro extremo)
      for (const anteriorLocalId of paso.dependencias?.anteriores ?? []) {
        const anteriorOrigDbId = pasoIdMap.get(anteriorLocalId)!;
        const key = `${anteriorOrigDbId}→${anteriorDbId}`;

        if (!dependenciasInsertadas.has(key)) {
          await tx.pasoDependencia.create({
            data: { anteriorId: anteriorOrigDbId, siguienteId: anteriorDbId },
          });
          dependenciasInsertadas.add(key);
          console.log(`   ✓ Dependencia: ${anteriorLocalId} → ${paso.id}`);
        }
      }
    }

    console.log(`\n✅ Trámite '${t.nombre}' ingresado correctamente.`);
    console.log(`   ID en DB : ${tramiteDb.id}`);
    console.log(`   Pasos    : ${pasoIdMap.size}`);
    console.log(`   Deps     : ${dependenciasInsertadas.size}`);
  });
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(`
Uso: bun run seed-tramite.ts <archivo.json> [opciones]

Opciones:
  --dry-run   Valida el JSON y muestra el plan sin escribir en la DB
  --upsert    Actualiza el trámite si ya existe (por nombre)
  --help      Muestra esta ayuda
    `);
    process.exit(0);
  }

  const jsonPath = args.find((a) => !a.startsWith("--"));
  const dryRun   = args.includes("--dry-run");
  const upsert   = args.includes("--upsert");

  if (!jsonPath) {
    console.error("❌ Debes proporcionar la ruta al archivo JSON.");
    process.exit(1);
  }

  // Leer y parsear el JSON
  let raw: unknown;
  try {
    const contenido = readFileSync(resolve(jsonPath), "utf-8");
    raw = JSON.parse(contenido);
  } catch (err) {
    console.error(`❌ No se pudo leer o parsear el archivo: ${(err as Error).message}`);
    process.exit(1);
  }

  // Validar estructura
  console.log(`\n🔍 Validando JSON: ${jsonPath}`);
  const { valido, errores, datos } = validarJsonTramite(raw);

  if (!valido || !datos) {
    console.error("\n❌ El JSON no es válido. Errores encontrados:\n");
    for (const e of errores) {
      console.error(`   [${e.campo}] ${e.mensaje}`);
    }
    process.exit(1);
  }

  console.log("   ✓ JSON válido");

  // Conectar Prisma e ingestar
  const prismaE = prisma;

  try {
    await ingestarTramite(prismaE, datos, { upsert, dryRun });
  } catch (err) {
    console.error(`\n❌ Error durante la ingesta: ${(err as Error).message}`);
    if (process.env.DEBUG) console.error(err);
    process.exit(1);
  } finally {
    await prismaE.$disconnect();
  }
}

main();