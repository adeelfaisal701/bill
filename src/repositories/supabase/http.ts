import type { Bill, BillType, BillTypeId, CreateBillInput, UpdateBillInput } from "@/types/bill";
import type { BusinessRepository, BillRepository, LedgerRepository, ProductRepository } from "@/repositories/interfaces";
import type { BusinessProfile } from "@/types/business";
import type { CreateLedgerAccountInput, LedgerAccount, LedgerTransaction, UpdateLedgerAccountInput } from "@/types/ledger";
import type { CreateProductInput, Product, UpdateProductInput } from "@/types/product";

async function request<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({})) as { data?: T; message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Supabase persistence request failed.");
  return payload.data as T;
}

async function get<T>(resource: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ resource, ...params });
  const response = await fetch(`/api/data?${query.toString()}`, { credentials: "same-origin", cache: "no-store" });
  const payload = await response.json().catch(() => ({})) as { data?: T; message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Supabase persistence request failed.");
  return payload.data as T;
}

export class SupabaseProductRepository implements ProductRepository {
  listProducts(): Promise<Product[]> { return get<Product[]>("products"); }
  getProduct(id: string): Promise<Product | null> { return get<Product | null>("product", { id }); }
  createProduct(input: CreateProductInput): Promise<Product> { return request<Product>({ resource: "product", input }); }
  updateProduct(id: string, patch: UpdateProductInput): Promise<Product> { return request<Product>({ resource: "update-product", id, patch }); }
  async deleteProduct(id: string): Promise<void> { await request({ resource: "delete-product", id }); }
}

export class SupabaseBillRepository implements BillRepository {
  listBills(): Promise<Bill[]> { return get<Bill[]>("bills"); }
  getBill(id: string): Promise<Bill | null> { return get<Bill | null>("bill", { id }); }
  createBill(input: CreateBillInput): Promise<Bill> { return request<Bill>({ resource: "bill", input }); }
  updateBill(id: string, input: UpdateBillInput): Promise<Bill> { return request<Bill>({ resource: "update-bill", id, patch: input }); }
  async deleteBill(id: string): Promise<void> { await request({ resource: "delete-bill", id }); }
  getBillTypes(): Promise<BillType[]> { return get<BillType[]>("bill-types"); }
  getNextBillNumber(): Promise<number> { return get<number>("next-bill-number"); }
  reserveNextSerialNumber(billType: BillTypeId): Promise<number> {
    return request<number>({ resource: "reserve-serial", input: { billType } });
  }
}

export class SupabaseBusinessRepository implements BusinessRepository {
  getProfile(): Promise<BusinessProfile | null> { return get<BusinessProfile | null>("business-profile"); }
  saveProfile(profile: BusinessProfile): Promise<BusinessProfile> { return request<BusinessProfile>({ resource: "business-profile", input: profile }); }
}

export class SupabaseLedgerRepository implements LedgerRepository {
  listAccounts(): Promise<LedgerAccount[]> { return get<LedgerAccount[]>("ledger-accounts"); }
  getAccount(id: string): Promise<LedgerAccount | null> { return get<LedgerAccount | null>("ledger-account", { id }); }
  getAccountBySlug(slug: string): Promise<LedgerAccount | null> { return get<LedgerAccount | null>("ledger-account-slug", { slug }); }
  createAccount(input: CreateLedgerAccountInput): Promise<LedgerAccount> { return request<LedgerAccount>({ resource: "ledger-account", input }); }
  updateAccount(id: string, patch: UpdateLedgerAccountInput): Promise<LedgerAccount> { return request<LedgerAccount>({ resource: "update-ledger-account", id, patch }); }
  async deleteAccount(id: string): Promise<void> { await request({ resource: "delete-ledger-account", id }); }
  listTransactions(accountId: string): Promise<LedgerTransaction[]> { return get<LedgerTransaction[]>("ledger-transactions", { accountId }); }
  getSummary(accountId: string, fromDate?: string, toDate?: string) {
    return get<{ totalDebit: number; totalCredit: number; currentBalance: number; totalTransactions: number; transactions: LedgerTransaction[] }>("ledger-summary", { accountId, ...(fromDate ? { fromDate } : {}), ...(toDate ? { toDate } : {}) });
  }
  createTransaction(accountId: string, input: Omit<LedgerTransaction, "id" | "ledgerAccountId" | "createdAt" | "updatedAt">): Promise<LedgerTransaction> { return request<LedgerTransaction>({ resource: "ledger-transaction", accountId, input }); }
  updateTransaction(id: string, patch: Partial<LedgerTransaction>): Promise<LedgerTransaction> { return request<LedgerTransaction>({ resource: "update-ledger-transaction", id, patch }); }
  async deleteTransaction(id: string): Promise<void> { await request({ resource: "delete-ledger-transaction", id }); }
  async syncBillToLedger(bill: Bill, accountId: string): Promise<void> { await request({ resource: "sync-bill-ledger", bill, accountId }); }
  async removeBillFromLedger(bill: Bill, accountId: string): Promise<void> { await request({ resource: "remove-bill-ledger", bill, accountId }); }
}
