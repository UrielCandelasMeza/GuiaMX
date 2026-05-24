"use client";

import { useRouter } from "next/navigation";
import { ListChecks, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tramite } from "@/types";

interface TramiteCardProps {
  tramite: Tramite;
}

export default function TramiteCard({ tramite }: TramiteCardProps) {
  const router = useRouter();
  const { id, nombre, descripcion, monto, totalPasos, _count } = tramite;
  // totalPasos viene del backend; _count.pasos es compatibilidad con datos estáticos
  const numPasos = totalPasos ?? _count?.pasos ?? 0;

  return (
    <article
      role="button"
      tabIndex={0}
      id={`tramite-card-${id}`}
      onClick={() => router.push(`/tramites/${id}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/tramites/${id}`)}
      className="flex cursor-pointer flex-col rounded-md border border-slate-200 bg-white p-5 transition-all hover:border-brand-600 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
    >
      {/* Precio badge */}
      {Number(monto) === 0 ? (
        <span className="inline-flex w-fit items-center rounded border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Gratuito
        </span>
      ) : (
        <span className="inline-flex w-fit items-center rounded border border-brand-100 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800">
          ${monto.toLocaleString("es-MX")} MXN
        </span>
      )}

      {/* Nombre */}
      <h2 className="mt-3 text-sm font-semibold text-slate-900 leading-snug">
        {nombre}
      </h2>

      {/* Descripción truncada */}
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
        {descripcion}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <ListChecks className="h-3.5 w-3.5" />
          {numPasos} pasos
        </span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </article>
  );
}
