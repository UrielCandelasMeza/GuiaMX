"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Circle,
  Clock,
  SkipForward,
  ChevronDown,
  ChevronUp,
  Loader2,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Tipos ───────────────────────────────────────────────────────────────── */
type EstadoTramite = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "CANCELADO";
type EstadoPaso = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "OMITIDO";

interface PasoSeguimiento {
  pasoId: string;
  orden: number;
  titulo: string;
  descripcionCorta: string;
  estado: EstadoPaso;
  completadoEn: string | null;
}

interface TramiteUsuario {
  id: string;
  estado: EstadoTramite;
  iniciadoEn: string;
  completadoEn: string | null;
  tramite: { id: string; nombre: string; monto: number };
  pasos: PasoSeguimiento[];
}

/* ── Iconos y colores de estado ──────────────────────────────────────────── */
const PASO_CFG = {
  PENDIENTE:   { icon: Circle,       cls: "text-slate-300" },
  EN_PROGRESO: { icon: Clock,        cls: "text-blue-500"  },
  COMPLETADO:  { icon: CheckCircle2, cls: "text-green-600" },
  OMITIDO:     { icon: SkipForward,  cls: "text-slate-300" },
} as const;

const TRAMITE_BADGE = {
  PENDIENTE:   "bg-slate-100 text-slate-600",
  EN_PROGRESO: "bg-blue-50 text-blue-700",
  COMPLETADO:  "bg-green-50 text-green-700",
  CANCELADO:   "bg-red-50 text-red-600",
} as const;

/* ── PasoItem ────────────────────────────────────────────────────────────── */
function PasoItem({
  paso,
  tramiteUsuarioId,
  token,
  onUpdate,
}: {
  paso: PasoSeguimiento;
  tramiteUsuarioId: string;
  token: string;
  onUpdate: (pasoId: string, estado: EstadoPaso) => void;
}) {
  const [loading, setLoading] = useState(false);
  const { icon: Icon, cls } = PASO_CFG[paso.estado];

  const actualizar = async (nuevoEstado: EstadoPaso) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/tramites/mis-tramites/${tramiteUsuarioId}/pasos/${paso.pasoId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        },
      );
      if (res.status === 422) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Completa los pasos anteriores primero.");
        return;
      }
      if (!res.ok) { toast.error("Error al actualizar el paso."); return; }

      const data = await res.json() as { tramiteCompletado: boolean };
      onUpdate(paso.pasoId, nuevoEstado);
      if (data.tramiteCompletado) toast.success("¡Trámite completado! 🎉");
    } catch {
      toast.error("Error de red.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="flex items-start gap-2.5 py-1.5">
      {/* Ícono de estado */}
      <span className={cn("mt-0.5 shrink-0", cls)}>
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
          : <Icon className="h-4 w-4" />}
      </span>

      {/* Título */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-xs leading-snug truncate",
          paso.estado === "COMPLETADO" ? "text-slate-600 line-through" : "text-slate-700",
          paso.estado === "EN_PROGRESO" && "font-medium no-underline",
        )}>
          {paso.orden}. {paso.titulo}
        </p>
      </div>

      {/* Botones rápidos */}
      {!loading && paso.estado !== "COMPLETADO" && (
        <button
          onClick={() => actualizar("COMPLETADO")}
          title="Marcar como completado"
          className="shrink-0 rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 hover:bg-green-100 transition-colors"
        >
          ✓
        </button>
      )}
      {!loading && paso.estado === "COMPLETADO" && (
        <button
          onClick={() => actualizar("PENDIENTE")}
          title="Revertir"
          className="shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-slate-100 transition-colors"
        >
          ↺
        </button>
      )}
    </li>
  );
}

/* ── TramiteCard ─────────────────────────────────────────────────────────── */
function TramiteCard({
  tu,
  token,
  onRefresh,
}: {
  tu: TramiteUsuario;
  token: string;
  onRefresh: () => void;
}) {
  const [expandido, setExpandido] = useState(tu.estado === "EN_PROGRESO");
  const [pasos, setPasos] = useState(tu.pasos);

  // Sincronizar si el padre hace refetch
  useEffect(() => { setPasos(tu.pasos); }, [tu.pasos]);

  const completados = pasos.filter(
    (p) => p.estado === "COMPLETADO" || p.estado === "OMITIDO",
  ).length;
  const progreso = pasos.length > 0
    ? Math.round((completados / pasos.length) * 100)
    : 0;

  const handleUpdate = useCallback(
    (pasoId: string, estado: EstadoPaso) => {
      setPasos((prev) =>
        prev.map((p) =>
          p.pasoId === pasoId ? { ...p, estado } : p,
        ),
      );
      // Si se completó un paso, refrescar el panel para actualizar el estado global
      if (estado === "COMPLETADO") onRefresh();
    },
    [onRefresh],
  );

  return (
    <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
      {/* Header del card */}
      <button
        onClick={() => setExpandido((v) => !v)}
        className="w-full flex items-start justify-between gap-2 px-3.5 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 leading-snug truncate">
            {tu.tramite.nombre}
          </p>

          {/* Barra de progreso */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  progreso === 100 ? "bg-green-500" : "bg-brand-600",
                )}
                style={{ width: `${progreso}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 shrink-0">
              {completados}/{pasos.length}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={cn(
            "inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium",
            TRAMITE_BADGE[tu.estado],
          )}>
            {tu.estado === "EN_PROGRESO" ? "En progreso" :
             tu.estado === "COMPLETADO" ? "Completado" :
             tu.estado === "CANCELADO" ? "Cancelado" : "Pendiente"}
          </span>
          {expandido
            ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
            : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
        </div>
      </button>

      {/* Lista de pasos (colapsable) */}
      {expandido && (
        <div className="border-t border-slate-100 px-3.5 py-2">
          <ul className="flex flex-col">
            {pasos.map((paso) => (
              <PasoItem
                key={paso.pasoId}
                paso={paso}
                tramiteUsuarioId={tu.id}
                token={token}
                onUpdate={handleUpdate}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── MisTramitesPanel ────────────────────────────────────────────────────── */
interface MisTramitesPanelProps {
  token: string;
  /** Incrementar para forzar un refetch (ej: tras respuesta del LLM) */
  refreshTrigger?: number;
}

export default function MisTramitesPanel({
  token,
  refreshTrigger = 0,
}: MisTramitesPanelProps) {
  const [tramites, setTramites] = useState<TramiteUsuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [open, setOpen] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/tramites/mis-tramites`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as TramiteUsuario[];
      setTramites(data.filter((t) => t.estado !== "COMPLETADO" && t.estado !== "CANCELADO"));
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  }, [token]);

  // Carga inicial
  useEffect(() => { cargar(); }, [cargar]);

  // Refetch cuando el LLM responde (refreshTrigger cambia)
  useEffect(() => {
    if (refreshTrigger > 0) cargar();
  }, [refreshTrigger, cargar]);

  const activos = tramites.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        id="mis-tramites-panel-trigger"
        aria-label="Abrir mis trámites"
        className="relative inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-brand-600 hover:text-brand-600"
      >
        <ClipboardList className="h-4 w-4" />
        Mis trámites
        {activos > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
            {activos}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="flex w-[340px] flex-col p-0 sm:w-[380px]">
        <SheetHeader className="px-6 pb-3 pt-5">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-brand-600" />
              Mis trámites activos
            </SheetTitle>
            <button
              onClick={cargar}
              title="Actualizar"
              className="rounded p-1 text-slate-400 hover:text-brand-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {activos > 0
              ? `${activos} tr\u00e1mite${activos !== 1 ? "s" : ""} en progreso`
              : "No tienes tr\u00e1mites activos"}
          </p>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {cargando ? (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-slate-100" />
              ))}
            </div>
          ) : tramites.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <ListChecks className="h-10 w-10 text-slate-200" strokeWidth={1.5} />
              <p className="text-sm text-slate-500">
                No tienes trámites activos.
                <br />
                Inicia uno desde la sección de Trámites.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tramites.map((tu) => (
                <TramiteCard
                  key={tu.id}
                  tu={tu}
                  token={token}
                  onRefresh={cargar}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-center text-xs text-slate-400">
            El asistente también puede actualizar tus pasos por ti
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
