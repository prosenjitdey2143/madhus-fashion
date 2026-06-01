import React from "react"
import { cn } from "../../utils/utils"

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function AdminCard({ children, className, noPadding = false }: AdminCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-dark-surface border border-charcoal/5 dark:border-dark-border rounded-xl shadow-soft dark:shadow-none transition-colors",
      !noPadding && "p-4 sm:p-6",
      className
    )}>
      {children}
    </div>
  )
}
