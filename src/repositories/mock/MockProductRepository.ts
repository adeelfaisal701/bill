import type { ProductRepository } from "@/repositories/interfaces";
import type { CreateProductInput, Product, UpdateProductInput } from "@/types/product";
import { readAll, writeAll } from "./storage";
import { SEED_PRODUCTS } from "./mockData";
import { generateId } from "@/lib/utilities";

const PRODUCTS_KEY = "products";

function loadProducts(): Product[] {
  return readAll<Product[]>(PRODUCTS_KEY, SEED_PRODUCTS);
}
function saveProducts(products: Product[]): void {
  writeAll(PRODUCTS_KEY, products);
}
function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class MockProductRepository implements ProductRepository {
  async listProducts(): Promise<Product[]> {
    return delay(
      [...loadProducts()].sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  async getProduct(id: string): Promise<Product | null> {
    return delay(loadProducts().find((p) => p.id === id) ?? null);
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    const now = new Date().toISOString();
    const product: Product = {
      id: generateId("prod"),
      name: input.name.trim(),
      stockQuantity: input.stockQuantity,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const products = loadProducts();
    products.push(product);
    saveProducts(products);
    return delay(product);
  }

  async updateProduct(id: string, patch: UpdateProductInput): Promise<Product> {
    const products = loadProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Product not found.");
    const updated: Product = {
      ...products[idx],
      ...patch,
      name: patch.name?.trim() ?? products[idx].name,
      stockQuantity: patch.stockQuantity ?? products[idx].stockQuantity,
      updatedAt: new Date().toISOString(),
    };
    products[idx] = updated;
    saveProducts(products);
    return delay(updated);
  }

  async deleteProduct(id: string): Promise<void> {
    saveProducts(loadProducts().filter((p) => p.id !== id));
    return delay(undefined);
  }
}
