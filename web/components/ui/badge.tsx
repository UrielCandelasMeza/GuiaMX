import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Variantes institucionales de Badge
 * default   → azul acento brand-600 (estado activo / primario)
 * info      → azul claro brand-100  (informativo)
 * secondary → superficie slate      (neutro)
 * outline   → borde divider         (sin relleno)
 * success   → verde semántico       (solo para estado completado)
 * warning   → ámbar semántico       (solo para estado en proceso)
 */
const badgeVariants = cva(
  [
    "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1",
    "overflow-hidden rounded border border-transparent",
    "px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors",
    "[&>svg]:pointer-events-none [&>svg]:size-3!",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Primario — brand-600 */
        default:   "bg-brand-600 text-white border-brand-600",
        /** Informativo — azul muy claro */
        info:      "bg-brand-100 text-brand-800 border-brand-600/20",
        /** Neutro — gris superficie */
        secondary: "bg-surface text-secondary border-divider",
        /** Sin relleno */
        outline:   "bg-transparent text-secondary border-divider",
        /** Estado completado — solo verde semántico */
        success:   "bg-green-100 text-green-800 border-green-200",
        /** Estado en proceso / aviso — solo ámbar semántico */
        warning:   "bg-amber-100 text-amber-800 border-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
