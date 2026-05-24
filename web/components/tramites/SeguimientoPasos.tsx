"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Clock, SkipForward, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type EstadoPaso = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "OMITIDO";

export interface PasoInteractivo {
  pasoId: string;
  orden: number;
  titulo: string;
  descripcionCorta: string;
  estado: EstadoPaso;
  completadoEn: string | null;
}

interface SeguimientoPasosProps {
  tramiteUsuarioId: string;
  token: string;
  pasosIniciales: PasoInteractivo[];
  onTramiteCompletado?: () => void;
}

const ESTADO_CFG = {
  PENDIENTE:   { label: "Pendiente",    icon: Circle,       cls: "text-slate-400" },
  EN_PROGRESO: { label: "En progreso",  icon: Clock,        cls: "text-blue-500" },
  COMPLETADO:  { label: "Completado",   icon: CheckCircle2, cls: "text-green-600" },
  OMITIDO:     { label: "Omitido",      icon: SkipForward,  cls: "text-slate-300" },
} as const;

export default function SeguimientoPasos({
  tramiteUsuarioId,
  token,
  pasosIniciales,
  onTramiteCompletado,
}: SeguimientoPasosProps) {
  const [pasos, setPasos] = useState<PasoInteractivo[]>(pasosIniciales);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const actualizarPaso = async (pasoId: string, nuevoEstado: EstadoPaso) => {
    if (updatingId) return; // evitar doble click
    setUpdatingId(pasoId);

    // Optimistic update
    setPasos((prev) =>
      prev.map((p) =>
        p.pasoId === pasoId
          ? { ...p, estado: nuevoEstado, completadoEn: nuevoEstado === "COMPLETADO" ? new Date().toISOString() : p.completadoEn }
          : p,
      ),
    );

    try {
      const res = await fetch(
        `${API_URL}/tramites/mis-tramites/${tramiteUsuarioId}/pasos/${pasoId}`,
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
        toast.error(body.error ?? "Debes completar los pasos anteriores primero.");
        // Revertir
        setPasos(pasosIniciales);
        return;
      }

      if (!res.ok) {
        toast.error("No se pudo actualizar el paso. Intenta de nuevo.");
        setPasos(pasosIniciales);
        return;
      }

      const result = await res.json() as {
        pasoId: string;
        estado: EstadoPaso;
        completadoEn: string | null;
        tramiteCompletado: boolean;
      };

      // Confirmar con la respuesta real
      setPasos((prev) =>
        prev.map((p) =>
          p.pasoId === result.pasoId
            ? { ...p, estado: result.estado, completadoEn: result.completadoEn }
            : p,
        ),
      );

      if (result.tramiteCompletado) {
        toast.success("¡Felicidades! Completaste todos los pasos del trámite. 🎉");
        startTransition(() => onTramiteCompletado?.());
      } else {
        const labels: Record<EstadoPaso, string> = {
          COMPLETADO:  "Paso marcado como completado ✅",
          EN_PROGRESO: "Paso marcado como en progreso",
          OMITIDO:     "Paso omitido",
          PENDIENTE:   "Paso regresado a pendiente",
        };
        toast.success(labels[nuevoEstado]);
      }
    } catch {
      toast.error("Error de red. Intenta de nuevo.");
      setPasos(pasosIniciales);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ol className="flex flex-col gap-0">
      {pasos.map((paso, idx) => {
        const isLast = idx === pasos.length - 1;
        const { icon: Icon, cls } = ESTADO_CFG[paso.estado];
        const cargando = updatingId === paso.pasoId;

        return (
          <li key={paso.pasoId} className="flex gap-4">
            {/* Línea vertical + ícono */}
            <div className="flex flex-col items-center">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center", cls)}>
                {cargando ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              {!isLast && <div className="mt-1 w-px flex-1 bg-slate-200 mb-1" />}
            </div>

            {/* Contenido */}
            <div className={cn("pb-8 pt-1 flex-1", isLast && "pb-0")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={cn(
                    "font-medium text-sm",
                    paso.estado === "PENDIENTE" || paso.estado === "OMITIDO"
                      ? "text-slate-400"
                      : "text-slate-900",
                  )}>
                    {paso.orden}. {paso.titulo}
                  </p>
                  {paso.descripcionCorta && (
                    <p className="mt-0.5 text-xs text-slate-500">{paso.descripcionCorta}</p>
                  )}
                  {paso.completadoEn && (
                    <p className="mt-1 text-xs text-slate-400">
                      Completado el {new Date(paso.completadoEn).toLocaleDateString("es-MX", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex shrink-0 gap-1.5">
                  {paso.estado !== "COMPLETADO" && (
                    <button
                      onClick={() => actualizarPaso(paso.pasoId, "COMPLETADO")}
                      disabled={!!updatingId}
                      title="Marcar como completado"
                      className="rounded border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors"
                    >
                      Completar
                    </button>
                  )}
                  {paso.estado === "PENDIENTE" && (
                    <button
                      onClick={() => actualizarPaso(paso.pasoId, "EN_PROGRESO")}
                      disabled={!!updatingId}
                      title="Marcar como en progreso"
                      className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                    >
                      Iniciar
                    </button>
                  )}
                  {paso.estado === "COMPLETADO" && (
                    <button
                      onClick={() => actualizarPaso(paso.pasoId, "PENDIENTE")}
                      disabled={!!updatingId}
                      title="Revertir a pendiente"
                      className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                    >
                      Revertir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
