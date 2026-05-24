import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface Paso {
  numero: number;
  titulo: string;
  descripcion?: string;
  completado?: boolean;
}

interface PasoTimelineProps {
  pasos: Paso[];
}

export default function PasoTimeline({ pasos }: PasoTimelineProps) {
  if (pasos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay pasos registrados aún.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-brand-100 pl-6">
      {pasos.map((paso, idx) => (
        <li
          key={paso.numero}
          className={cn("mb-8", idx === pasos.length - 1 && "mb-0")}
        >
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-brand-100">
            {paso.completado ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-brand-600" />
            )}
          </span>
          <h3 className="text-sm font-semibold text-brand-900">
            Paso {paso.numero}: {paso.titulo}
          </h3>
          {paso.descripcion && (
            <p className="mt-1 text-sm text-muted-foreground">
              {paso.descripcion}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
