import { cn } from "../utils/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-secondary/20 rounded-sm w-full h-full", className)}
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
