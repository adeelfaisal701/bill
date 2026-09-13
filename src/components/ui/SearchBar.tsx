import { Search } from "lucide-react";
import { cn } from "@/lib/utilities";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-4 text-[15px] text-ink-900 placeholder:text-ink-300 focus-ring focus:border-brand-400"
      />
    </div>
  );
}
