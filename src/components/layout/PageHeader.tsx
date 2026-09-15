import React from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-5 pb-2 sm:flex-nowrap sm:px-6 sm:pt-6">
      <div className="min-w-0 flex-1">
        <h1 className="break-words text-xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
      </div>
      <div className="min-w-0 max-w-full shrink-0">{action}</div>
    </div>
  );
}
