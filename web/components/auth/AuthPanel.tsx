import { Building2 } from "lucide-react";

interface AuthPanelProps {
  /** Título mostrado bajo el ícono */
  title?: string;
  /** Subtítulo / descripción */
  description?: string;
}

/**
 * Panel izquierdo institucional — reutilizable en login y registro.
 * Visible solo en desktop (lg:flex), oculto en mobile.
 */
export default function AuthPanel({
  title = "GuiaMX",
  description = "Tu guía digital para trámites gubernamentales en México. Información clara, en un solo lugar.",
}: AuthPanelProps) {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center gap-6 bg-brand-900 px-12 py-16 text-white h-full">
      <Building2 className="h-16 w-16 text-brand-100 flex-shrink-0" strokeWidth={1.5} />

      <div className="text-center space-y-3 max-w-xs">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        <p className="text-brand-100 text-[15px] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Decorador institucional */}
      <div className="mt-8 flex items-center gap-2">
        <div className="h-px w-12 bg-brand-800" />
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-100/60">
          Gobierno de México
        </span>
        <div className="h-px w-12 bg-brand-800" />
      </div>
    </div>
  );
}
