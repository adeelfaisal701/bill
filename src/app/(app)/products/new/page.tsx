"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { useProducts } from "@/hooks/useProducts";
import * as productService from "@/services/productService";

export default function AddProductPage() {
  const router = useRouter();
  const { show } = useToast();
  const { products } = useProducts();
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedStock = Number(stockQuantity);
      const parsedCostPrice = costPrice === "" ? undefined : Number(costPrice);
      if (isNaN(parsedStock) || parsedStock < 0) {
        throw new Error("Stock quantity must be a valid number.");
      }
      if (costPrice !== "" && (isNaN(parsedCostPrice!) || parsedCostPrice! < 0)) {
        throw new Error("Cost price must be a valid number.");
      }
      await productService.createProduct({ name, costPrice: parsedCostPrice, stockQuantity: parsedStock }, products);
      show("Product added successfully.", "success");
      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Add Product" />
      <div className="px-4 sm:px-6">
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Product Name"
              required
              placeholder="Enter product name"
              value={name}
              error={error}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              autoFocus
            />
            <Input
              label="Cost Price"
              type="number"
              placeholder="Enter cost price"
              value={costPrice}
              onChange={(e) => { setCostPrice(e.target.value); setError(""); }}
              min="0"
            />
            <Input
              label="Stock Quantity"
              type="number"
              required
              placeholder="Enter initial stock"
              value={stockQuantity}
              onChange={(e) => { setStockQuantity(e.target.value); setError(""); }}
              min="0"
            />
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? "Saving…" : "Save Product"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
