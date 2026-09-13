import React from "react";
import { cn } from "@/lib/utilities";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-ink-100 bg-surface shadow-card", className)}
      {...props}
    />
  );
}
