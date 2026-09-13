"use client";

import { useRouter } from "next/navigation";
import { Plus, Package } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/context/ToastContext";
import * as productService from "@/services/productService";
import type { Product } from "@/types/product";

export default function ProductsPage() {
  const { products, loading, error, reload } = useProducts();
  const router = useRouter();
  const { show } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  async function handleToggleActive(product: Product) {
    try {
      await productService.setProductActive(product.id, !product.isActive);
      show(product.isActive ? "Product deactivated." : "Product activated.", "success");
      reload();
    } catch {
      show("Unable to update product. Please try again.", "error");
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await productService.deleteProduct(pendingDelete.id);
      show("Product deleted.", "success");
      setPendingDelete(null);
      reload();
    } catch {
      show("Unable to delete product. Please try again.", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        action={
          <Button size="sm" onClick={() => router.push("/products/new")}>
            <Plus size={16} className="mr-1" /> Add Product
          </Button>
        }
      />

      <div className="px-4 sm:px-6">
        {loading ? (
          <LoadingState rows={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package size={26} />}
            title="No products yet."
            body="Add your first product to start creating bills."
            actionLabel="Add Product"
            onAction={() => router.push("/products/new")}
          />
        ) : (
          <div className="space-y-3 pb-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={() => router.push(`/products/${p.id}/edit`)}
                onToggleActive={() => handleToggleActive(p)}
                onDelete={() => setPendingDelete(p)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this product?"
        message={`"${pendingDelete?.name}" will be permanently removed. Bills that already used this product will keep their original product name.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
