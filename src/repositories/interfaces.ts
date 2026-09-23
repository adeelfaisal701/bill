// Repository contracts. UI and services depend only on these interfaces —
// never on a concrete storage implementation (mock localStorage today,
// Firebase/Firestore or another cloud backend later). Swap the
// implementation returned by repositories/index.ts and nothing else in
// the app needs to change.

import type { Bill, BillType, BillTypeId, CreateBillInput, UpdateBillInput } from "@/types/bill";
import type { CreateProductInput, Product, UpdateProductInput } from "@/types/product";
import type { BusinessProfile } from "@/types/business";
import type { CreateLedgerAccountInput, LedgerAccount, LedgerTransaction, UpdateLedgerAccountInput } from "@/types/ledger";
import type { AppUser } from "@/types/user";

export interface BillRepository {
  listBills(): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | null>;
  createBill(input: CreateBillInput): Promise<Bill>;
  updateBill(id: string, input: UpdateBillInput): Promise<Bill>;
  deleteBill(id: string): Promise<void>;
  getBillTypes(): Promise<BillType[]>;
  getNextBillNumber(billType: BillTypeId): Promise<number>;
  /**
   * Atomically reserves and returns the next serial number for a bill type.
  * The number is independent for each bill type. The mock implementation is
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

export interface LedgerRepository {
  listAccounts(): Promise<LedgerAccount[]>;
  getAccount(id: string): Promise<LedgerAccount | null>;
  getAccountBySlug(slug: string): Promise<LedgerAccount | null>;
  createAccount(input: CreateLedgerAccountInput): Promise<LedgerAccount>;
  updateAccount(id: string, patch: UpdateLedgerAccountInput): Promise<LedgerAccount>;
  deleteAccount(id: string): Promise<void>;
  listTransactions(accountId: string): Promise<LedgerTransaction[]>;
  getSummary(accountId: string, fromDate?: string, toDate?: string): Promise<{
    totalDebit: number;
    totalCredit: number;
    currentBalance: number;
    totalTransactions: number;
    transactions: LedgerTransaction[];
  }>;
  createTransaction(accountId: string, input: Omit<LedgerTransaction, "id" | "ledgerAccountId" | "createdAt" | "updatedAt">): Promise<LedgerTransaction>;
  updateTransaction(id: string, patch: Partial<LedgerTransaction>): Promise<LedgerTransaction>;
  deleteTransaction(id: string): Promise<void>;
  syncBillToLedger(bill: Bill, accountId: string): Promise<void>;
  removeBillFromLedger(bill: Bill, accountId: string): Promise<void>;
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
  ledger?: LedgerRepository;
  /** "mock" = local browser storage, isolated dev data. "cloud" = real backend. */
  mode: "mock" | "cloud";
}
