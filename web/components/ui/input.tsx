import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Layout
        "h-9 w-full min-w-0 rounded border border-divider bg-white px-3 py-1",
        // Typography
        "text-sm text-body placeholder:text-placeholder",
        // Transitions
        "transition-colors outline-none",
        // Focus — brand-600 ring
        "focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/30",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60",
        // File input
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-body",
        // Validation error — rojo solo para mensajes de error
        "aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-400/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
