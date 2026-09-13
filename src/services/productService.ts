import { repositories } from "@/repositories";
import type { CreateProductInput, Product, UpdateProductInput } from "@/types/product";
import { validateProductName } from "@/lib/validation";

export async function listProducts(): Promise<Product[]> {
  return repositories.products.listProducts();
}

export async function listActiveProducts(): Promise<Product[]> {
  const products = await repositories.products.listProducts();
  return products.filter((p) => p.isActive);
}

export async function createProduct(
  input: CreateProductInput,
  existing: Product[]
): Promise<Product> {
  const error = validateProductName(
    input.name,
    existing.map((p) => p.name)
  );
  if (error) throw new Error(error);
  return repositories.products.createProduct(input);
}

export async function updateProduct(
  id: string,
  patch: UpdateProductInput,
  existing: Product[]
): Promise<Product> {
  if (patch.name !== undefined) {
    const others = existing.filter((p) => p.id !== id);
    const error = validateProductName(
      patch.name,
      others.map((p) => p.name)
    );
    if (error) throw new Error(error);
  }
  return repositories.products.updateProduct(id, patch);
}

export async function setProductActive(id: string, isActive: boolean): Promise<Product> {
  return repositories.products.updateProduct(id, { isActive });
}

export async function deleteProduct(id: string): Promise<void> {
  return repositories.products.deleteProduct(id);
}
