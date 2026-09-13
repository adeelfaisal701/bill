import { FileText, ChevronRight } from "lucide-react";

export function BillTypeCard({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white p-5 text-left shadow-card transition-shadow hover:shadow-floating focus-ring"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <FileText size={22} />
        </div>
        <div>
          <p className="font-semibold text-ink-900">{title}</p>
          <p className="text-sm text-brand-600">{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="text-ink-300" />
    </button>
  );
}
