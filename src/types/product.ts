export interface Product {
  id: string;
  name: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  stockQuantity: number;
}

export interface UpdateProductInput {
  name?: string;
  stockQuantity?: number;
  isActive?: boolean;
}
