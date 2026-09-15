"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Package, Settings, BookText } from "lucide-react";
import { cn } from "@/lib/utilities";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/ledger", label: "Ledger", icon: BookText },
  { href: "/products", label: "Products", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-surface/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors focus-ring",
                  active ? "text-brand-600" : "text-ink-400"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
