import { cn } from "@/lib/utils";
import { FileCheck, FileQuestion } from "lucide-react";

interface DocumentoBadgeProps {
  nombre: string;
  requerido?: boolean;
}

export default function DocumentoBadge({ nombre, requerido = false }: DocumentoBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        requerido
          ? "border-brand-600 bg-brand-50 text-brand-800"
          : "border-border bg-muted text-muted-foreground"
      )}
    >
      {requerido ? (
        <FileCheck className="h-3.5 w-3.5 text-brand-600" />
      ) : (
        <FileQuestion className="h-3.5 w-3.5" />
      )}
      {nombre}
      {requerido && <span className="text-brand-600">*</span>}
    </span>
  );
}
