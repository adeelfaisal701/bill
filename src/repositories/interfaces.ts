// Repository contracts. UI and services depend only on these interfaces —
// never on a concrete storage implementation (mock localStorage today,
// Firebase/Firestore or another cloud backend later). Swap the
// implementation returned by repositories/index.ts and nothing else in
// the app needs to change.

import type { Bill, BillType, BillTypeId, CreateBillInput, UpdateBillInput } from "@/types/bill";
import type { CreateProductInput, Product, UpdateProductInput } from "@/types/product";
import type { BusinessProfile } from "@/types/business";
import type { AppUser } from "@/types/user";

export interface BillRepository {
  listBills(): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | null>;
  createBill(input: CreateBillInput): Promise<Bill>;
  updateBill(id: string, input: UpdateBillInput): Promise<Bill>;
  deleteBill(id: string): Promise<void>;
  getBillTypes(): Promise<BillType[]>;
  getNextBillNumber(): Promise<number>;
  /**
   * Atomically reserves and returns the next serial number for a bill type.
  * The number is global across all bill types. The mock implementation is
  * persistent local storage; a real cloud backend
   * MUST perform this as a server-side transaction so concurrent devices
   * never receive the same number (see docs/ARCHITECTURE.md).
   */
  reserveNextSerialNumber(billType: BillTypeId): Promise<number>;
}

export interface ProductRepository {
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(input: CreateProductInput): Promise<Product>;
  updateProduct(id: string, patch: UpdateProductInput): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
}

export interface BusinessRepository {
  getProfile(): Promise<BusinessProfile | null>;
  saveProfile(profile: BusinessProfile): Promise<BusinessProfile>;
}

export interface AuthRepository {
  getCurrentUser(): Promise<AppUser | null>;
  signIn(email: string, password: string): Promise<AppUser>;
  signUp(name: string, email: string, password: string): Promise<AppUser>;
  signOut(): Promise<void>;
}

export interface DataRepositories {
  bills: BillRepository;
  products: ProductRepository;
  business: BusinessRepository;
  auth: AuthRepository;
  /** "mock" = local browser storage, isolated dev data. "cloud" = real backend. */
  mode: "mock" | "cloud";
}
