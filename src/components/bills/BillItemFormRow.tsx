import { useState, useRef, useEffect } from "react";
import { Trash2, ChevronDown } from "lucide-react";
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

function SearchableProductSelect({
  label,
  value,
  onChange,
  products,
}: {
  label: string;
  value: string;
  onChange: (productId: string | null, product?: Product) => void;
  products: Product[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selectedProduct = products.find((p) => p.id === value);

  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
      {label && <label className="text-sm font-medium text-ink-700">{label}</label>}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery("");
        }}
        className="flex w-full items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3 text-[15px] text-ink-900 focus-ring transition-colors focus:border-brand-400 text-left"
      >
        <span className="truncate">
          {selectedProduct ? selectedProduct.name : "Select a product"}
        </span>
        <ChevronDown size={16} className="text-ink-400 flex-shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1.5 w-full rounded-xl border border-ink-200 bg-white shadow-xl max-h-64 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-ink-100 bg-ink-50/50">
            <input
              type="text"
              autoFocus
              className="w-full rounded-lg bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 outline-none border border-ink-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto p-1.5 custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${
                !value
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "hover:bg-ink-50 text-ink-700"
              }`}
            >
              Select a product
            </button>
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange(p.id, p);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  value === p.id
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "hover:bg-ink-50 text-ink-900"
                }`}
              >
                {p.name}
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-ink-500">
                No products found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
          <SearchableProductSelect
            label="Product"
            value={item.productId ?? ""}
            onChange={(productId, product) => {
              onChange({
                productId,
                productNameSnapshot: product?.name ?? "",
                costPrice: product?.costPrice,
              });
            }}
            products={products}
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
