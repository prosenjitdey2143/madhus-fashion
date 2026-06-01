import { cn } from "../utils/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("animate-pulse bg-secondary/10 dark:bg-dark-border/50 rounded-sm w-full h-full", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col group w-full h-full">
      <div className="aspect-[3/4] w-full mb-6 overflow-hidden relative">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="flex justify-between items-start space-x-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Skeleton className="w-24 h-24 rounded-full" />
      <Skeleton className="w-16 h-4" />
    </div>
  );
}
