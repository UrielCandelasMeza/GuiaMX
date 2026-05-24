import { Scale } from "lucide-react";

interface AuthPanelProps {
  title?: string;
  description?: string;
}

export default function AuthPanel({
  title = "GuiaMX",
  description = "Tu guía digital para trámites gubernamentales en México. Información clara, en un solo lugar.",
}: AuthPanelProps) {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-[#F7F9FC] border-r border-[#E5E7EB] px-12 py-16 h-full">
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-[#0A0A0A]" strokeWidth={1.75} />
        <span className="text-base font-semibold tracking-tight text-[#0A0A0A]">
          GuíasMX
        </span>
      </div>

      <div className="space-y-4 max-w-xs">
        <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A] leading-tight">
          {title}
        </h1>
        <p className="text-[15px] leading-relaxed text-[#737373]">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px w-8 bg-[#E5E7EB]" />
        <span className="label-xs text-[#A3A3A3]">
          Gobierno de México
        </span>
        <div className="h-px w-8 bg-[#E5E7EB]" />
      </div>
    </div>
  );
}
