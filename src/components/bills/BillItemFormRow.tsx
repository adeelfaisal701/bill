"use client";

import { Trash2 } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utilities";
import type { Product } from "@/types/product";

export interface DraftBillItem {
  key: string;
  productId: string | null;
  productNameSnapshot: string;
  quantity: number;
  rate: number;
  costPrice?: number;
}

export function BillItemFormRow({
  item,
  products,
  onChange,
  onRemove,
  removable,
}: {
  item: DraftBillItem;
  products: Product[];
  onChange: (patch: Partial<DraftBillItem>) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  const amount = Math.max(0, item.quantity) * Math.max(0, item.rate);

  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Select
            label="Product"
            value={item.productId ?? ""}
            onChange={(e) => {
              const productId = e.target.value || null;
              const product = products.find((p) => p.id === productId);
              onChange({
                productId,
                productNameSnapshot: product?.name ?? "",
                costPrice: product?.costPrice,
              });
            }}
            options={[
              { value: "", label: "Select a product" },
              ...products.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove product"
            className="mt-7 rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-danger focus-ring"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Input
          label="Description"
          placeholder="Product / description"
          value={item.productNameSnapshot}
          onChange={(e) => onChange({ productId: null, productNameSnapshot: e.target.value })}
        />
        <Input
          label="Quantity"
          type="number"
          min={0}
          value={item.quantity || ""}
          onChange={(e) => onChange({ quantity: Number(e.target.value) })}
        />
        <Input
          label="Rate"
          type="number"
          min={0}
          value={item.rate || ""}
          onChange={(e) => onChange({ rate: Number(e.target.value) })}
        />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2">
        <span className="text-sm text-ink-500">Amount</span>
        <span className="font-mono text-sm font-semibold text-ink-900">
          {formatCurrency(amount)}
        </span>
      </div>
    </div>
  );
}
