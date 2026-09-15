"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Package, Settings, Wallet, BookText } from "lucide-react";
import { cn } from "@/lib/utilities";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/ledger", label: "Ledger", icon: BookText },
  { href: "/products", label: "Products", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Desktop/tablet equivalent of BottomNavigation — same routes, different
// chrome, so the app doesn't just stretch a mobile layout across a wide
// screen (spec section 19).
export function SideNavigation() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-ink-100 bg-surface md:flex md:flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
          <Wallet size={18} />
        </div>
        <span className="font-semibold text-ink-900">BillBook</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-ring",
                active ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:bg-ink-50"
              )}
            >
              <Icon size={19} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
