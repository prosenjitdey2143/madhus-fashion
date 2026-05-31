import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../utils/utils"

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold tracking-widest uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-charcoal text-primary",
        secondary: "bg-secondary text-charcoal",
        outline: "text-charcoal border border-charcoal/20",
        accent: "bg-accent text-white",
        new: "bg-success text-white",
        sale: "bg-error text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
