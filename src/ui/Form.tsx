import * as React from "react"
import { cn } from "../utils/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-primary/50 dark:border-dark-border bg-transparent px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-charcoal/40 dark:placeholder:text-dark-muted/60 dark:text-dark-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-charcoal dark:focus-visible:ring-dark-border disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-md border border-primary/50 dark:border-dark-border bg-transparent px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-charcoal/40 dark:placeholder:text-dark-muted/60 dark:text-dark-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-charcoal dark:focus-visible:ring-dark-border disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Input, Textarea }
