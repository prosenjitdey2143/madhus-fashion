import * as React from "react"
import { motion } from "framer-motion"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../utils/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-charcoal text-primary dark:bg-dark-text dark:text-dark-bg hover:bg-charcoal/90 dark:hover:bg-white shadow-soft hover:shadow-soft-hover rounded-full",
        destructive: "bg-error text-white hover:bg-error/90 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 rounded-full",
        outline: "border border-charcoal/20 dark:border-dark-border bg-transparent hover:bg-primary/50 dark:hover:bg-dark-surfaceHover text-charcoal dark:text-dark-text rounded-full",
        secondary: "bg-secondary dark:bg-dark-pill text-charcoal dark:text-dark-text hover:bg-secondary/80 dark:hover:bg-dark-surfaceHover rounded-full",
        ghost: "hover:bg-primary/50 dark:hover:bg-dark-surfaceHover text-charcoal dark:text-dark-text rounded-full",
        link: "text-charcoal dark:text-dark-text underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-8 py-2",
        sm: "h-9 px-4",
        lg: "h-14 px-10 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button

    const motionProps = asChild ? {} : {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: { type: "spring", stiffness: 400, damping: 17 }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref as any}
        {...motionProps}
        {...(props as any)}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
