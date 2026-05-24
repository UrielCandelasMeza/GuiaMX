import { cn } from "@/lib/utils";
import type { Paso, TipoDocumento } from "@/types";

interface PasoTimelineProps {
  pasos: Paso[];
  /** Índice del paso actual (0-based). Omitir si no aplica. */
  pasoActualIdx?: number;
}

export default function PasoTimeline({
  pasos,
  pasoActualIdx,
}: PasoTimelineProps) {
  if (pasos.length === 0) {
    return (
      <p className="text-sm text-secondary">
        No hay pasos registrados para este trámite.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-0">
      {pasos.map((paso, idx) => {
        const isLast    = idx === pasos.length - 1;
        const completado = pasoActualIdx !== undefined && idx < pasoActualIdx;
        const actual     = pasoActualIdx !== undefined && idx === pasoActualIdx;
        const estado     = completado ? "completado" : actual ? "actual" : "futuro";

        return (
          <li key={paso.id} className="flex gap-4">
            {/* Círculo numerado + línea vertical */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  estado === "completado" && "bg-brand-600 text-white",
                  estado === "actual"     && "bg-white text-brand-600 ring-2 ring-brand-600",
                  estado === "futuro"     && "bg-slate-100 text-slate-400"
                )}
              >
                {paso.orden}
              </div>
              {!isLast && (
                <div className="mt-1 w-px flex-1 bg-slate-200 mb-1" />
              )}
            </div>

            {/* Contenido */}
            <div className={cn("pb-8 pt-1", isLast && "pb-0")}>
              <p
                className={cn(
                  "font-medium",
                  estado === "futuro" ? "text-slate-400" : "text-slate-900"
                )}
              >
                {paso.titulo}
              </p>
              {paso.descripcionCorta && (
                <p className="mt-0.5 text-sm text-slate-600">
                  {paso.descripcionCorta}
                </p>
              )}
              {/* Documentos requeridos en este paso */}
              {paso.documentosRequeridos?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {paso.documentosRequeridos.map((doc: TipoDocumento) => (
                    <span
                      key={doc.id}
                      className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700"
                    >
                      {doc.nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
