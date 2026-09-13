"use client";

import { MoreVertical, Pencil, Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/types/product";

export function ProductCard({
  product,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-4 shadow-card">
      <div className="min-w-0">
        <p className="truncate font-medium text-ink-900">{product.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge tone={product.isActive ? "success" : "neutral"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge tone="neutral">
            Stock: {product.stockQuantity ?? 0} Pieces
          </Badge>
        </div>
      </div>
      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={`Actions for ${product.name}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="rounded-full p-2 text-ink-400 hover:bg-ink-100 focus-ring"
        >
          <MoreVertical size={18} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div
              role="menu"
              className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-floating"
            >
              <MenuButton
                icon={<Pencil size={16} />}
                label="Edit"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
              />
              <MenuButton
                icon={<Power size={16} />}
                label={product.isActive ? "Deactivate" : "Activate"}
                onClick={() => {
                  setMenuOpen(false);
                  onToggleActive();
                }}
              />
              <MenuButton
                icon={<Trash2 size={16} />}
                label="Delete"
                tone="danger"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "danger";
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={
        "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium hover:bg-ink-50 " +
        (tone === "danger" ? "text-danger" : "text-ink-700")
      }
    >
      {icon}
      {label}
    </button>
  );
}
