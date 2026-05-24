import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Variantes institucionales GuiaMX
 * ─────────────────────────────────
 * default     → bg-brand-600 blanco  (acción principal)
 * outline     → borde brand-800      (acción secundaria)
 * ghost       → transparente brand   (acción terciaria)
 * link        → subrayado brand-600  (enlace en texto)
 * slate       → slate-700            (eliminar / destructivo — nunca rojo vivo)
 * info        → bg-brand-100         (acción informativa suave)
 */
const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "rounded border border-transparent bg-clip-padding",
    "text-sm font-semibold whitespace-nowrap",
    "transition-colors duration-150 outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-brand-600/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-400/20",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Botón primario — azul acento */
        default:
          "bg-brand-600 text-white hover:bg-brand-800 active:bg-brand-900",

        /** Botón secundario — contorno brand-800 */
        outline:
          "border-brand-800 text-brand-800 bg-transparent hover:bg-brand-50 active:bg-brand-100",

        /** Botón terciario / ghost — sin borde */
        ghost:
          "text-brand-600 bg-transparent hover:bg-brand-50 active:bg-brand-100",

        /** Link en texto */
        link:
          "text-brand-600 underline-offset-4 hover:underline hover:text-brand-800 bg-transparent",

        /** Acción de eliminar — slate oscuro, nunca rojo vivo en UI */
        slate:
          "bg-transparent text-slate-700 border-slate-300 hover:bg-slate-100 active:bg-slate-200",

        /** Alerta / info — fondo azul muy claro */
        info:
          "bg-brand-100 text-brand-800 border-brand-100 hover:bg-brand-600/10 active:bg-brand-600/20",
      },
      size: {
        default: "h-9 gap-1.5 px-4",
        sm:      "h-7 gap-1 px-3 text-xs rounded",
        lg:      "h-11 gap-2 px-6 text-base",
        icon:    "size-9",
        "icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
