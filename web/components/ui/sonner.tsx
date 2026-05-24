"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

/**
 * Toaster institucional GuiaMX — tema fijo "light", sin next-themes.
 * Paleta: primario brand-600 (#2563EB), sin modo oscuro.
 */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    icons={{
      success: <CircleCheckIcon className="size-4 text-green-600" />,
      info:    <InfoIcon className="size-4 text-brand-600" />,
      warning: <TriangleAlertIcon className="size-4 text-amber-600" />,
      error:   <OctagonXIcon className="size-4 text-red-600" />,
      loading: <Loader2Icon className="size-4 animate-spin text-brand-600" />,
    }}
    style={
      {
        "--normal-bg":     "#FFFFFF",
        "--normal-text":   "#0F172A",
        "--normal-border": "#E2E8F0",
        "--border-radius": "0.375rem",
        "--success-bg":    "#F0FDF4",
        "--success-text":  "#166534",
        "--success-border":"#BBF7D0",
        "--error-bg":      "#FEF2F2",
        "--error-text":    "#991B1B",
        "--error-border":  "#FECACA",
      } as React.CSSProperties
    }
    {...props}
  />
)

export { Toaster }
