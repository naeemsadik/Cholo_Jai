"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-cream-200 shimmer", className)}
      {...props}
    />
  );
}

export { Skeleton };