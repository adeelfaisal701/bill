export interface Product {
  id: string;
  name: string;
  costPrice?: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  costPrice?: number;
  stockQuantity: number;
}

export interface UpdateProductInput {
  name?: string;
  costPrice?: number;
  stockQuantity?: number;
  isActive?: boolean;
}
