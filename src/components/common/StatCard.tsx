import React from "react";
import { cn } from "@/lib/utilities";

export function StatCard({
  label,
  value,
  sublabel,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-white p-5 shadow-card", className)}>
      <p className="text-sm font-medium text-white/80">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {sublabel && <p className="mt-1 text-sm text-white/80">{sublabel}</p>}
    </div>
  );
}
