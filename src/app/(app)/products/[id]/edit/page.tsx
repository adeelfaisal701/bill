"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/context/ToastContext";
import { useProducts } from "@/hooks/useProducts";
import * as productService from "@/services/productService";
import type { Product } from "@/types/product";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { show } = useToast();
  const { products, loading } = useProducts();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [addStock, setAddStock] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    const p = products.find((x) => x.id === id) ?? null;
    setProduct(p);
    if (p) {
      setName(p.name);
      setCostPrice(p.costPrice !== undefined ? String(p.costPrice) : "");
    }
  }, [loading, products, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const addedStock = addStock ? Number(addStock) : 0;
      const parsedCostPrice = costPrice === "" ? undefined : Number(costPrice);
      if (isNaN(addedStock) || addedStock < 0) {
        throw new Error("Add stock must be a valid positive number.");
      }
      if (costPrice !== "" && (isNaN(parsedCostPrice!) || parsedCostPrice! < 0)) {
        throw new Error("Cost price must be a valid number.");
      }
      
      const newStockQuantity = (product?.stockQuantity ?? 0) + addedStock;
      
      await productService.updateProduct(id, { name, costPrice: parsedCostPrice, stockQuantity: newStockQuantity }, products);
      show("Product updated successfully.", "success");
      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update product.");
    } finally {
      setSaving(false);
    }
  }

  if (product === undefined) return <LoadingState rows={2} />;
  if (product === null) {
    return <div className="p-6 text-center text-sm text-ink-500">Product not found.</div>;
  }

  return (
    <div>
      <PageHeader title="Edit Product" />
      <div className="px-4 sm:px-6">
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Product Name"
              required
              value={name}
              error={error}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              autoFocus
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-700">Current Stock</span>
              <span className="text-lg font-semibold text-ink-900">{product.stockQuantity ?? 0} Pieces</span>
            </div>
            <Input
              label="Cost Price"
              type="number"
              placeholder="Enter cost price"
              value={costPrice}
              onChange={(e) => { setCostPrice(e.target.value); setError(""); }}
              min="0"
            />
            <Input
              label="Add Stock"
              type="number"
              placeholder="0"
              value={addStock}
              onChange={(e) => { setAddStock(e.target.value); setError(""); }}
              min="0"
            />
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
