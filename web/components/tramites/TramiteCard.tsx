import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";

type TramiteEstado = "pendiente" | "en_proceso" | "completado" | "requiere_atencion";

interface TramiteCardProps {
  id: string;
  titulo: string;
  descripcion: string;
  estado: TramiteEstado;
}

const estadoConfig: Record<TramiteEstado, { label: string; icon: React.ReactNode; className: string }> = {
  pendiente: {
    label: "Pendiente",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "bg-brand-100 text-brand-800",
  },
  en_proceso: {
    label: "En proceso",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "bg-amber-100 text-amber-800",
  },
  completado: {
    label: "Completado",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    className: "bg-green-100 text-green-800",
  },
  requiere_atencion: {
    label: "Requiere atención",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    className: "bg-red-100 text-red-800",
  },
};

export default function TramiteCard({ id, titulo, descripcion, estado }: TramiteCardProps) {
  const config = estadoConfig[estado];

  return (
    <Link
      href={`/tramites/${id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-brand-900 group-hover:text-brand-600 transition-colors">
          {titulo}
        </h2>
        <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{descripcion}</p>
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          config.className
        )}
      >
        {config.icon}
        {config.label}
      </span>
    </Link>
  );
}
