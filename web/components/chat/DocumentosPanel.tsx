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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/* ── Catálogo estático de los 16 documentos, agrupados ──────────────────── */
interface DocumentoInfo {
  /** Identificador único del tipo de documento (tipoDocumentoId) */
  tipoId: string;
  nombre: string;
}

const GRUPOS: { categoria: string; docs: DocumentoInfo[] }[] = [
  {
    categoria: "Identificación oficial",
    docs: [
      { tipoId: "curp",             nombre: "CURP" },
      { tipoId: "ine",              nombre: "INE" },
      { tipoId: "pasaporte",        nombre: "Pasaporte" },
      { tipoId: "cartilla_militar", nombre: "Cartilla militar" },
    ],
  },
  {
    categoria: "Fiscal y laboral",
    docs: [
      { tipoId: "rfc",    nombre: "RFC" },
      { tipoId: "nss",    nombre: "NSS" },
      { tipoId: "efirma", nombre: "EFirma" },
    ],
  },
  {
    categoria: "Registro civil",
    docs: [
      { tipoId: "acta_nacimiento", nombre: "Acta de nacimiento" },
    ],
  },
  {
    categoria: "Digital CDMX",
    docs: [
      { tipoId: "llave_mx",   nombre: "LLAVE MX" },
      { tipoId: "llave_cdmx", nombre: "LLAVE CDMX" },
    ],
  },
  {
    categoria: "Contacto",
    docs: [
      { tipoId: "correo_personal", nombre: "Correo personal" },
      { tipoId: "telefono",        nombre: "Número de teléfono" },
    ],
  },
  {
    categoria: "Profesional",
    docs: [
      { tipoId: "cedula_profesional", nombre: "Cédula profesional" },
    ],
  },
  {
    categoria: "Vehicular",
    docs: [
      { tipoId: "licencia_vehicular", nombre: "Licencia vehicular y placa" },
    ],
  },
  {
    categoria: "Domicilio",
    docs: [
      { tipoId: "comprobante_domicilio", nombre: "Comprobante de domicilio" },
    ],
  },
  {
    categoria: "Otros",
    docs: [
      { tipoId: "id_secundaria", nombre: "Identificación secundaria" },
    ],
  },
];

const TOTAL_DOCS = GRUPOS.reduce((acc, g) => acc + g.docs.length, 0); // 16

/* ── Tipos de la respuesta del API ──────────────────────────────────────── */
interface UserDocumento {
  id: string;
  tipoDocumentoId: string;
}

/* ── Hook de estado de documentos ───────────────────────────────────────── */
function useDocumentos(token: string) {
  /** Mapa tipoId → id del registro en el API (null = no registrado) */
  const [registrados, setRegistrados] = useState<Map<string, string | null>>(
    new Map()
  );
  const [cargando, setCargando] = useState(true);

  /* Carga inicial */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setCargando(true);
      try {
        const res = await fetch(`${API_URL}/usuarios/me/documentos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as UserDocumento[];
        if (!cancelled) {
          const mapa = new Map<string, string | null>(
            GRUPOS.flatMap((g) => g.docs.map((d) => [d.tipoId, null]))
          );
          for (const doc of data) {
            mapa.set(doc.tipoDocumentoId, doc.id);
          }
          setRegistrados(mapa);
        }
      } catch {
        // Sin API disponible — iniciamos con todo vacío
        if (!cancelled) {
          setRegistrados(
            new Map(
              GRUPOS.flatMap((g) => g.docs.map((d) => [d.tipoId, null]))
            )
          );
        }
      } finally {
        if (!cancelled) setCargando(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  /* Toggle: agrega o elimina un documento */
  const toggle = useCallback(
    async (tipoId: string, nombre: string) => {
      const existingId = registrados.get(tipoId) ?? null;

      if (existingId) {
        /* ── OFF: eliminar ── */
        // Optimistic
        setRegistrados((prev) => {
          const m = new Map(prev);
          m.set(tipoId, null);
          return m;
        });
        try {
          const res = await fetch(
            `${API_URL}/usuarios/me/documentos/${existingId}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!res.ok) throw new Error();
          toast.success(`"${nombre}" eliminado de tu perfil.`);
        } catch {
          // Revertir si falla
          setRegistrados((prev) => {
            const m = new Map(prev);
            m.set(tipoId, existingId);
            return m;
          });
          toast.error(`No se pudo eliminar "${nombre}". Inténtalo de nuevo.`);
        }
      } else {
        /* ── ON: agregar ── */
        // Optimistic con id temporal
        const tempId = `temp-${tipoId}`;
        setRegistrados((prev) => {
          const m = new Map(prev);
          m.set(tipoId, tempId);
          return m;
        });
        try {
          const res = await fetch(`${API_URL}/usuarios/me/documentos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ tipoDocumentoId: tipoId }),
          });
          if (!res.ok) throw new Error();
          const created = (await res.json()) as UserDocumento;
          setRegistrados((prev) => {
            const m = new Map(prev);
            m.set(tipoId, created.id);
            return m;
          });
          toast.success(`"${nombre}" agregado a tu perfil.`);
        } catch {
          // Revertir
          setRegistrados((prev) => {
            const m = new Map(prev);
            m.set(tipoId, null);
            return m;
          });
          toast.error(`No se pudo agregar "${nombre}". Inténtalo de nuevo.`);
        }
      }
    },
    [token, registrados]
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
        <span className="text-sm text-secondary">Gestiona tus documentos</span>
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
              <div
                key={i}
                className="h-9 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        ) : (
          GRUPOS.map((grupo) => (
            <div key={grupo.categoria} className="mb-5">
              <p className="label-xs mb-2 text-secondary/70">
                {grupo.categoria}
              </p>
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
                          activo ? "text-brand-600" : "text-slate-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          activo ? "text-body font-medium" : "text-secondary"
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

      <SheetContent
        side="right"
        className="flex w-80 flex-col p-0 sm:w-96"
      >
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
