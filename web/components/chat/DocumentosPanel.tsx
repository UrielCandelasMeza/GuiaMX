"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Catálogo estático de los 16 documentos, agrupados ──────────────────── */
interface DocumentoInfo {
  /** Identificador único del tipo de documento (tipoDocumentoId) */
  tipoId: string;
  nombre: string;
}

// tipoId coincide exactamente con TipoDocumentoEnum del backend
const GRUPOS: { categoria: string; docs: DocumentoInfo[] }[] = [
  {
    categoria: "Identificación oficial",
    docs: [
      { tipoId: "CURP", nombre: "CURP" },
      { tipoId: "INE", nombre: "INE" },
      { tipoId: "PASAPORTE", nombre: "Pasaporte" },
      { tipoId: "CARTILLA_MILITAR", nombre: "Cartilla militar" },
    ],
  },
  {
    categoria: "Fiscal y laboral",
    docs: [
      { tipoId: "RFC", nombre: "RFC" },
      { tipoId: "NSS", nombre: "NSS" },
      { tipoId: "EFIRMA", nombre: "EFirma" },
    ],
  },
  {
    categoria: "Registro civil",
    docs: [{ tipoId: "ACTA_NACIMIENTO", nombre: "Acta de nacimiento" }],
  },
  {
    categoria: "Digital CDMX",
    docs: [
      { tipoId: "LLAVE_MX", nombre: "LLAVE MX" },
      { tipoId: "LLAVE_CDMX", nombre: "LLAVE CDMX" },
    ],
  },
  {
    categoria: "Contacto",
    docs: [
      { tipoId: "CORREO_PERSONAL", nombre: "Correo personal" },
      { tipoId: "NUMERO_TELEFONO", nombre: "Número de teléfono" },
    ],
  },
  {
    categoria: "Profesional",
    docs: [{ tipoId: "CERTIFICACION_ACADEMICA", nombre: "Cédula profesional" }],
  },
  {
    categoria: "Vehicular",
    docs: [{ tipoId: "LICENCIA_VEHICULAR_PLACA", nombre: "Licencia vehicular y placa" }],
  },
  {
    categoria: "Domicilio",
    docs: [{ tipoId: "COMPROBANTE_DOMICILIO", nombre: "Comprobante de domicilio" }],
  },
  {
    categoria: "Otros",
    docs: [{ tipoId: "IDENTIFICACION_SECUNDARIA", nombre: "Identificación secundaria" }],
  },
];

const TOTAL_DOCS = GRUPOS.reduce((acc, g) => acc + g.docs.length, 0); // 16

/* ── Tipos de la respuesta del API ──────────────────────────────────────── */
// GET /documentos → [{ id, tipo, nombre, tieneDocumento }]
interface ApiDocumento {
  id: string;           // ID del TipoDocumento en BD
  tipo: string;         // Coincide con TipoDocumentoEnum
  nombre: string;
  tieneDocumento: boolean;
}

/* ── Hook de estado de documentos ───────────────────────────────────────── */
function useDocumentos(token: string) {
  /**
   * Mapa tipo (CURP, INE…) → tipoDocumentoId en BD (null = no registrado)
   * La API usa tipoDocumentoId para el toggle, no un id de userDocumento
   */
  const [registrados, setRegistrados] = useState<Map<string, string | null>>(
    new Map(),
  );
  const [cargando, setCargando] = useState(true);

  /* Carga inicial: GET /documentos */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setCargando(true);
      try {
        const res = await fetch(`${API_URL}/documentos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as ApiDocumento[];
        if (!cancelled) {
          // Mapa: tipo → id (del TipoDocumento) si tieneDocumento, null si no
          const mapa = new Map<string, string | null>();
          for (const doc of data) {
            mapa.set(doc.tipo, doc.tieneDocumento ? doc.id : null);
          }
          setRegistrados(mapa);
        }
      } catch {
        if (!cancelled) {
          setRegistrados(
            new Map(GRUPOS.flatMap((g) => g.docs.map((d) => [d.tipoId, null]))),
          );
        }
      } finally {
        if (!cancelled) setCargando(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  /**
   * Toggle: llama a POST /documentos/toggle/:tipoDocumentoId
   * El backend decide si crear o eliminar el registro.
   */
  const toggle = useCallback(
    async (tipoId: string, nombre: string) => {
      const bdId = registrados.get(tipoId);
      if (!bdId) return; // No tenemos el id de BD todavía (cargando)

      const yaActivo = registrados.get(tipoId) !== null;

      // Optimistic update
      setRegistrados((prev) => {
        const m = new Map(prev);
        m.set(tipoId, yaActivo ? null : bdId);
        return m;
      });

      try {
        const res = await fetch(`${API_URL}/documentos/toggle/${bdId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const result = (await res.json()) as { tieneDocumento: boolean };
        // Sincronizar con la respuesta real
        setRegistrados((prev) => {
          const m = new Map(prev);
          m.set(tipoId, result.tieneDocumento ? bdId : null);
          return m;
        });
        toast.success(
          result.tieneDocumento
            ? `"${nombre}" agregado a tu perfil.`
            : `"${nombre}" eliminado de tu perfil.`,
        );
      } catch {
        // Revertir al estado anterior
        setRegistrados((prev) => {
          const m = new Map(prev);
          m.set(tipoId, yaActivo ? bdId : null);
          return m;
        });
        toast.error(`No se pudo actualizar "${nombre}". Inténtalo de nuevo.`);
      }
    },
    [token, registrados],
  );

  const conteo = [...registrados.values()].filter(Boolean).length;

  return { registrados, cargando, toggle, conteo };
}

/* ── Contenido del Sheet ─────────────────────────────────────────────────── */
function PanelContent({ token }: { token: string }) {
  const { registrados, cargando, toggle, conteo } = useDocumentos(token);

  return (
    <>
      {/* Sub-encabezado con contador */}
      <div className="flex items-center justify-between px-6 pb-2 pt-1">
        <span className="text-sm text-brand-900/95">
          Gestiona tus documentos
        </span>
        <span className="text-sm font-semibold text-brand-600">
          {conteo} / {TOTAL_DOCS} registrados
        </span>
      </div>

      <Separator />

      {/* Lista de grupos */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {cargando ? (
          /* Skeleton */
          <div className="flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : (
          GRUPOS.map((grupo) => (
            <div key={grupo.categoria} className="mb-5">
              <p className="label-md mb-2 text-brand-600">{grupo.categoria}</p>
              {grupo.docs.map((doc) => {
                const activo = !!registrados.get(doc.tipoId);
                return (
                  <div
                    key={doc.tipoId}
                    className="flex items-center justify-between border-b border-slate-100 py-2"
                  >
                    {/* Izquierda */}
                    <div className="flex items-center gap-2.5">
                      <FileText
                        className={cn(
                          "h-4 w-4 shrink-0",
                          activo ? "text-brand-600" : "text-slate-400",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          activo
                            ? "text-body font-medium"
                            : "text-brand-900/95",
                        )}
                      >
                        {doc.nombre}
                      </span>
                    </div>

                    {/* Switch */}
                    <Switch
                      id={`doc-switch-${doc.tipoId}`}
                      size="sm"
                      defaultChecked={activo}
                      aria-label={`${activo ? "Eliminar" : "Agregar"} ${doc.nombre}`}
                      onCheckedChange={() => toggle(doc.tipoId, doc.nombre)}
                    />
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ── DocumentosPanel (exportado) ─────────────────────────────────────────── */
export default function DocumentosPanel({ token }: { token: string }) {
  return (
    <Sheet>
      <SheetTrigger
        id="docs-panel-trigger"
        className="flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-600 hover:text-brand-600"
      >
        <FileText className="h-3.5 w-3.5" />
        Mis documentos
      </SheetTrigger>

      <SheetContent side="right" className="flex w-80 flex-col p-0 sm:w-96">
        <SheetHeader className="px-6 pt-5 pb-3">
          <SheetTitle className="text-base font-semibold text-brand-900">
            Mis documentos
          </SheetTitle>
        </SheetHeader>

        <PanelContent token={token} />
      </SheetContent>
    </Sheet>
  );
}
