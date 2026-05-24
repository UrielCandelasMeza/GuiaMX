import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "rounded border border-transparent bg-clip-padding",
    "text-sm font-semibold whitespace-nowrap",
    "transition-colors duration-150 outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/30",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-400/20",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-[#0A0A0A] text-white hover:bg-[#222222] active:bg-[#333333]",

        outline:
          "border-[#E5E7EB] text-[#0A0A0A] bg-transparent hover:bg-[#F3F4F6] active:bg-[#E5E7EB]",

        secondary:
          "bg-[#F3F4F6] text-[#0A0A0A] border-[#E5E7EB] hover:bg-[#E5E7EB] active:bg-[#D1D5DB]",

        ghost:
          "text-[#0A0A0A] bg-transparent hover:bg-[#F3F4F6] active:bg-[#E5E7EB]",

        link:
          "text-[#0A0A0A] underline-offset-4 hover:underline hover:text-[#737373] bg-transparent",

        slate:
          "bg-transparent text-[#737373] border-[#E5E7EB] hover:bg-[#F3F4F6] active:bg-[#E5E7EB]",

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
