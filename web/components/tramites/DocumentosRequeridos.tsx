"use client";

import { FileText, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompatibilidadDoc } from "@/app/(dashboard)/tramites/[id]/page";

interface DocumentosRequeridosProps {
  compatibilidad: CompatibilidadDoc[];
}

export default function DocumentosRequeridos({
  compatibilidad,
}: DocumentosRequeridosProps) {
  const obligatorios = compatibilidad.filter((d) => d.requerido);

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-brand-900">
          Documentos necesarios
        </h3>
      </div>

      {compatibilidad.length === 0 ? (
        <p className="text-xs text-secondary">
          Este trámite no requiere documentos previos.
        </p>
      ) : (
        <ul className="mb-2 flex flex-col gap-2.5">
          {compatibilidad.map((doc) => (
            <li key={doc.nombre} className="flex items-center gap-2.5">
              {doc.disponible ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-red-400" />
              )}
              <span
                className={cn(
                  "text-sm",
                  doc.disponible ? "text-slate-700" : "text-slate-400",
                  doc.requerido && !doc.disponible && "font-medium",
                )}
              >
                {doc.nombre}
                {doc.requerido && (
                  <span className="ml-1 text-xs text-red-400">*</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {obligatorios.length > 0 && (
        <p className="mt-3 text-xs text-placeholder">* Documento obligatorio</p>
      )}
    </aside>
  );
}
