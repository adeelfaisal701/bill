import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Bill, BillItem, BillType, BillTypeId, CreateBillInput, UpdateBillInput } from "@/types/bill";
import type { BusinessProfile } from "@/types/business";
import type { CreateLedgerAccountInput, LedgerAccount, LedgerAccountType, LedgerTransaction, OpeningBalanceType, UpdateLedgerAccountInput } from "@/types/ledger";
import type { CreateProductInput, Product, UpdateProductInput } from "@/types/product";
import { generateId } from "@/lib/utilities";

const BUSINESS_ID = "00000000-0000-0000-0000-000000000001";
const SESSION_COOKIE = "billbook_session";
const DEFAULT_EMAIL = "ramzaan12@gmail.com";

interface ProductRow {
  id: string;
  name: string;
  cost_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BillTypeRow {
  id: BillTypeId;
  name: string;
  format_key: string;
  last_serial_number: number;
}

interface BillItemRow {
  id: string;
  bill_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  quantity: number;
  rate: number;
  cost_price: number | null;
  amount: number;
}

interface BillRow {
  id: string;
  bill_type_id: BillTypeId;
  serial_number: number;
  bill_number: string | null;
  ledger_account_id: string | null;
  party_name: string;
  party_phone: string | null;
  party_address: string | null;
  date: string;
  subtotal: number;
  tax_percentage: number | null;
  tax_amount: number | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  total_amount: number;
  notes: string | null;
  status: "draft" | "saved";
  payment_status: "pending" | "paid";
  created_at: string;
  updated_at: string;
  bill_items?: BillItemRow[];
}

interface LedgerAccountRow {
  id: string;
  business_id: string;
  company_id: string | null;
  name: string;
  account_code: string | null;
  type: LedgerAccountType;
  contact_details: string | null;
  project_name: string | null;
  project_code: string | null;
  tax_enabled: boolean;
  tax_name: string | null;
  tax_rate: number | null;
  opening_balance: number;
  opening_balance_type: OpeningBalanceType;
  created_at: string;
  updated_at: string;
}

interface LedgerTransactionRow {
  id: string;
  ledger_account_id: string;
  business_id: string;
  bill_id: string | null;
  date: string;
  voucher_number: string | null;
  payment_mode: string | null;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  transaction_type: LedgerTransaction["transactionType"];
  created_at: string;
  updated_at: string;
}

function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server configuration is incomplete. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function requireFixedSession(): Promise<void> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) throw new Error("Unauthorized");

  try {
    const session = JSON.parse(raw) as { userId?: string; email?: string };
    const expectedEmail = (process.env.AUTH_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();
    if (session.userId !== "fixed-admin" || session.email?.toLowerCase() !== expectedEmail) {
      throw new Error("Unauthorized");
    }
  } catch {
    throw new Error("Unauthorized");
  }
}

function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    costPrice: row.cost_price ?? undefined,
    stockQuantity: row.stock_quantity,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function itemFromRow(row: BillItemRow): BillItem {
  return {
    id: row.id,
    billId: row.bill_id,
    productId: row.product_id,
    productNameSnapshot: row.product_name_snapshot,
    quantity: row.quantity,
    rate: row.rate,
    costPrice: row.cost_price ?? undefined,
    amount: row.amount,
  };
}

function billFromRow(row: BillRow): Bill {
  return {
    id: row.id,
    billType: row.bill_type_id,
    serialNumber: row.serial_number,
    billNumber: row.bill_number ?? undefined,
    ledgerAccountId: row.ledger_account_id ?? undefined,
    partyName: row.party_name,
    partyPhone: row.party_phone ?? undefined,
    partyAddress: row.party_address ?? undefined,
    date: row.date,
    items: (row.bill_items ?? []).map(itemFromRow),
    subtotal: row.subtotal,
    taxPercentage: row.tax_percentage ?? undefined,
    taxAmount: row.tax_amount ?? undefined,
    discountPercentage: row.discount_percentage ?? undefined,
    discountAmount: row.discount_amount ?? undefined,
    totalAmount: row.total_amount,
    notes: row.notes ?? undefined,
    status: row.status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function accountFromRow(row: LedgerAccountRow): LedgerAccount {
  return {
    id: row.id,
    name: row.name,
    accountCode: row.account_code ?? undefined,
    type: row.type,
    companyId: row.company_id ?? undefined,
    contactDetails: row.contact_details ?? undefined,
    projectName: row.project_name ?? undefined,
    projectCode: row.project_code ?? undefined,
    taxEnabled: row.tax_enabled,
    taxName: row.tax_name ?? undefined,
    taxRate: row.tax_rate ?? undefined,
    openingBalance: row.opening_balance,
    openingBalanceType: row.opening_balance_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function transactionFromRow(row: LedgerTransactionRow): LedgerTransaction {
  return {
    id: row.id,
    ledgerAccountId: row.ledger_account_id,
    billId: row.bill_id ?? undefined,
    date: row.date,
    voucherNumber: row.voucher_number ?? undefined,
    paymentMode: row.payment_mode ?? undefined,
    description: row.description,
    debit: row.debit,
    credit: row.credit,
    balance: row.balance,
    transactionType: row.transaction_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensure<T>(result: { data: T | null; error: { message: string } | null }): Promise<T> {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error("Supabase returned no data.");
  return result.data;
}

export async function listProducts(): Promise<Product[]> {
  const client = getAdminClient();
  const result = await client.from("products").select("*").eq("business_id", BUSINESS_ID).order("name");
  const rows = await ensure(result);
  return (rows as ProductRow[]).map(productFromRow);
}

export async function getProduct(id: string): Promise<Product | null> {
  const client = getAdminClient();
  const result = await client.from("products").select("*").eq("business_id", BUSINESS_ID).eq("id", id).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data ? productFromRow(result.data as ProductRow) : null;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const now = new Date().toISOString();
  const result = await getAdminClient().from("products").insert({
    id: generateId("prod"),
    business_id: BUSINESS_ID,
    name: input.name.trim(),
    cost_price: typeof input.costPrice === "number" && !Number.isNaN(input.costPrice) ? input.costPrice : null,
    stock_quantity: input.stockQuantity,
    is_active: true,
    created_at: now,
    updated_at: now,
  }).select("*").single();
  return productFromRow(await ensure(result) as ProductRow);
}

export async function updateProduct(id: string, patch: UpdateProductInput): Promise<Product> {
  const values: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) values.name = patch.name.trim();
  if (patch.costPrice !== undefined) values.cost_price = typeof patch.costPrice === "number" && !Number.isNaN(patch.costPrice) ? patch.costPrice : null;
  if (patch.stockQuantity !== undefined) values.stock_quantity = patch.stockQuantity;
  if (patch.isActive !== undefined) values.is_active = patch.isActive;

  const result = await getAdminClient().from("products").update(values).eq("business_id", BUSINESS_ID).eq("id", id).select("*").single();
  return productFromRow(await ensure(result) as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const result = await getAdminClient().from("products").delete().eq("business_id", BUSINESS_ID).eq("id", id);
  if (result.error) throw new Error(result.error.message);
}

async function getBillRows(filterId?: string): Promise<BillRow[]> {
  let query = getAdminClient().from("bills").select("*, bill_items(*)").eq("business_id", BUSINESS_ID).order("created_at", { ascending: false });
  if (filterId) query = query.eq("id", filterId);
  const result = await query;
  return await ensure(result) as BillRow[];
}

export async function listBills(): Promise<Bill[]> {
  return (await getBillRows()).map(billFromRow);
}

export async function getBill(id: string): Promise<Bill | null> {
  const rows = await getBillRows(id);
  return rows[0] ? billFromRow(rows[0]) : null;
}

export async function getBillTypes(): Promise<BillType[]> {
  const result = await getAdminClient().from("bill_types").select("*").eq("business_id", BUSINESS_ID).order("id");
  const rows = await ensure(result) as BillTypeRow[];
  return rows.map((row) => ({ id: row.id, name: row.name, formatKey: row.format_key, lastSerialNumber: row.last_serial_number }));
}

export async function getNextBillNumber(): Promise<number> {
  const result = await getAdminClient().rpc("get_next_bill_number", { p_business_id: BUSINESS_ID });
  return await ensure(result) as number;
}

export async function reserveNextSerialNumber(_billType: BillTypeId): Promise<number> {
  const result = await getAdminClient().rpc("reserve_global_bill_number", { p_business_id: BUSINESS_ID });
  return await ensure(result) as number;
}

export async function createBill(input: CreateBillInput): Promise<Bill> {
  const serialNumber = await reserveNextSerialNumber(input.billType);
  const now = new Date().toISOString();
  const billId = crypto.randomUUID();
  const items = input.items.map((item) => ({
    id: crypto.randomUUID(),
    bill_id: billId,
    product_id: item.productId,
    product_name_snapshot: item.productNameSnapshot,
    quantity: item.quantity,
    rate: item.rate,
    cost_price: typeof item.costPrice === "number" && !Number.isNaN(item.costPrice) ? item.costPrice : null,
    amount: Math.round(item.quantity * item.rate * 100) / 100,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxPercentage = input.taxPercentage || 0;
  const discountPercentage = input.discountPercentage || 0;
  const taxAmount = (subtotal * taxPercentage) / 100;
  const discountAmount = (subtotal * discountPercentage) / 100;

  const result = await getAdminClient().rpc("create_bill_with_items", {
    p_business_id: BUSINESS_ID,
    p_bill: {
      id: billId,
      bill_type_id: input.billType,
      serial_number: serialNumber,
      bill_number: String(serialNumber),
      ledger_account_id: input.ledgerAccountId ?? null,
      party_name: input.partyName.trim(),
      party_phone: input.partyPhone?.trim() || null,
      party_address: input.partyAddress?.trim() || null,
      date: input.date,
      subtotal,
      tax_percentage: taxAmount > 0 ? taxPercentage : null,
      tax_amount: taxAmount > 0 ? taxAmount : null,
      discount_percentage: discountAmount > 0 ? discountPercentage : null,
      discount_amount: discountAmount > 0 ? discountAmount : null,
      total_amount: subtotal + taxAmount - discountAmount,
      notes: input.notes?.trim() || null,
      status: "saved",
      payment_status: input.paymentStatus ?? "pending",
      created_at: now,
      updated_at: now,
    },
    p_items: items,
  });
  if (result.error) throw new Error(result.error.message);
  const bill = await getBill(billId);
  if (!bill) throw new Error("Bill was created but could not be loaded.");
  return bill;
}

export async function updateBill(id: string, patch: UpdateBillInput): Promise<Bill> {
  const existing = await getBill(id);
  if (!existing) throw new Error("Bill not found.");
  const subtotal = patch.items ? patch.items.reduce((sum, item) => sum + Math.round(item.quantity * item.rate * 100) / 100, 0) : existing.subtotal;
  const taxPercentage = patch.taxPercentage ?? existing.taxPercentage ?? 0;
  const discountPercentage = patch.discountPercentage ?? existing.discountPercentage ?? 0;
  const values: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    ledger_account_id: patch.ledgerAccountId !== undefined ? patch.ledgerAccountId : existing.ledgerAccountId ?? null,
    party_name: patch.partyName ?? existing.partyName,
    party_phone: patch.partyPhone !== undefined ? patch.partyPhone : existing.partyPhone ?? null,
    party_address: patch.partyAddress !== undefined ? patch.partyAddress : existing.partyAddress ?? null,
    date: patch.date ?? existing.date,
    subtotal,
    tax_percentage: taxPercentage > 0 ? taxPercentage : null,
    tax_amount: taxPercentage > 0 ? subtotal * taxPercentage / 100 : null,
    discount_percentage: discountPercentage > 0 ? discountPercentage : null,
    discount_amount: discountPercentage > 0 ? subtotal * discountPercentage / 100 : null,
    total_amount: subtotal + subtotal * taxPercentage / 100 - subtotal * discountPercentage / 100,
    notes: patch.notes !== undefined ? patch.notes : existing.notes ?? null,
    payment_status: patch.paymentStatus ?? existing.paymentStatus,
  };
  const client = getAdminClient();
  if (patch.items) {
    const items = patch.items.map((item) => {
      const existingItem = existing.items.find(
        (existingItem) => existingItem.id === item.id
      );

      return {
        id: item.id ?? crypto.randomUUID(),
        bill_id: id,
        product_id: item.productId,
        product_name_snapshot: item.productNameSnapshot,
        quantity: item.quantity,
        rate: item.rate,
        cost_price:
          typeof item.costPrice === "number" && !Number.isNaN(item.costPrice)
            ? item.costPrice
            : existingItem?.costPrice ?? null,
        amount: Math.round(item.quantity * item.rate * 100) / 100,
      };
    });
    const deleted = items.length === 0
      ? await client.from("bill_items").delete().eq("bill_id", id)
      : await client.from("bill_items").delete().eq("bill_id", id).not("id", "in", `(${items.map((item) => item.id).join(",")})`);
    if (deleted.error) throw new Error(deleted.error.message);
    const upserted = await client.from("bill_items").upsert(items);
    if (upserted.error) throw new Error(upserted.error.message);
  }
  const result = await client.from("bills").update(values).eq("business_id", BUSINESS_ID).eq("id", id).select("id").single();
  await ensure(result);
  const updated = await getBill(id);
  if (!updated) throw new Error("Bill was updated but could not be loaded.");
  return updated;
}

export async function deleteBill(id: string): Promise<void> {
  const result = await getAdminClient().from("bills").delete().eq("business_id", BUSINESS_ID).eq("id", id);
  if (result.error) throw new Error(result.error.message);
}

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const result = await getAdminClient().from("businesses").select("*").eq("id", BUSINESS_ID).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return null;
  const row = result.data as { business_name: string; address: string | null; phone: string | null; logo_url: string | null; created_at: string; updated_at: string };
  return {
    businessName: row.business_name,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function saveBusinessProfile(profile: BusinessProfile): Promise<BusinessProfile> {
  const result = await getAdminClient().from("businesses").update({
    business_name: profile.businessName,
    address: profile.address ?? null,
    phone: profile.phone ?? null,
    logo_url: profile.logoUrl ?? null,
    updated_at: profile.updatedAt,
  }).eq("id", BUSINESS_ID).select("*").single();
  const row = await ensure(result) as { business_name: string; address: string | null; phone: string | null; logo_url: string | null; created_at: string; updated_at: string };
  return {
    businessName: row.business_name,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getLedgerAccountRow(id: string): Promise<LedgerAccountRow | null> {
  const result = await getAdminClient().from("ledger_accounts").select("*").eq("business_id", BUSINESS_ID).eq("id", id).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data as LedgerAccountRow | null;
}

async function requireLedgerAccount(id: string): Promise<LedgerAccountRow> {
  const account = await getLedgerAccountRow(id);
  if (!account) throw new Error("Ledger account not found for this business.");
  return account;
}

async function requireBillForBusiness(id: string): Promise<Bill> {
  const bill = await getBill(id);
  if (!bill) throw new Error("Bill not found for this business.");
  return bill;
}

export async function listLedgerAccounts(): Promise<LedgerAccount[]> {
  const result = await getAdminClient().from("ledger_accounts").select("*").eq("business_id", BUSINESS_ID).order("name");
  return (await ensure(result) as LedgerAccountRow[]).map(accountFromRow);
}

export async function getLedgerAccount(id: string): Promise<LedgerAccount | null> {
  const row = await getLedgerAccountRow(id);
  return row ? accountFromRow(row) : null;
}

function ledgerSlug(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim().toLowerCase().replace(/\s+/g, "-");
}

export async function getLedgerAccountBySlug(slug: string): Promise<LedgerAccount | null> {
  const normalized = decodeURIComponent(slug);
  const accounts = await listLedgerAccounts();
  return accounts.find((account) => account.id === normalized || ledgerSlug(account.name) === normalized) ?? null;
}

export async function createLedgerAccount(input: CreateLedgerAccountInput): Promise<LedgerAccount> {
  if (!input.companyId?.trim()) throw new Error("Please select a company/business.");
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const row = {
    id,
    business_id: BUSINESS_ID,
    company_id: input.companyId.trim(),
    name: input.name.trim(),
    account_code: input.accountCode?.trim() || null,
    type: input.type ?? "Society / Company",
    contact_details: input.contactDetails?.trim() || null,
    project_name: input.projectName?.trim() || null,
    project_code: input.projectCode?.trim() || null,
    tax_enabled: input.taxEnabled ?? true,
    tax_name: input.taxName?.trim() || null,
    tax_rate: input.taxRate ?? 0,
    opening_balance: input.openingBalance ?? 0,
    opening_balance_type: input.openingBalanceType ?? "debit",
    created_at: now,
    updated_at: now,
  };
  const result = await getAdminClient().from("ledger_accounts").insert(row).select("*").single();
  const account = accountFromRow(await ensure(result) as LedgerAccountRow);
  if (account.openingBalance !== 0) {
    await createLedgerTransactionInternal(account.id, {
      date: now,
      description: "Opening Balance",
      debit: account.openingBalanceType === "debit" ? Math.abs(account.openingBalance) : 0,
      credit: account.openingBalanceType === "credit" ? Math.abs(account.openingBalance) : 0,
      balance: 0,
      paymentMode: "Opening",
      transactionType: "opening",
    });
  }
  return account;
}

export async function updateLedgerAccount(id: string, patch: UpdateLedgerAccountInput): Promise<LedgerAccount> {
  await requireLedgerAccount(id);
  if (patch.companyId !== undefined && !patch.companyId.trim()) throw new Error("Please select a company/business.");
  const values: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.companyId !== undefined) values.company_id = patch.companyId.trim();
  if (patch.name !== undefined) values.name = patch.name.trim();
  if (patch.accountCode !== undefined) values.account_code = patch.accountCode.trim() || null;
  if (patch.type !== undefined) values.type = patch.type;
  if (patch.contactDetails !== undefined) values.contact_details = patch.contactDetails || null;
  if (patch.projectName !== undefined) values.project_name = patch.projectName || null;
  if (patch.projectCode !== undefined) values.project_code = patch.projectCode || null;
  if (patch.taxEnabled !== undefined) values.tax_enabled = patch.taxEnabled;
  if (patch.taxName !== undefined) values.tax_name = patch.taxName || null;
  if (patch.taxRate !== undefined) values.tax_rate = patch.taxRate;
  if (patch.openingBalance !== undefined) values.opening_balance = patch.openingBalance;
  if (patch.openingBalanceType !== undefined) values.opening_balance_type = patch.openingBalanceType;
  const result = await getAdminClient().from("ledger_accounts").update(values).eq("business_id", BUSINESS_ID).eq("id", id).select("*").single();
  return accountFromRow(await ensure(result) as LedgerAccountRow);
}

export async function deleteLedgerAccount(id: string): Promise<void> {
  await requireLedgerAccount(id);
  const result = await getAdminClient().from("ledger_accounts").delete().eq("business_id", BUSINESS_ID).eq("id", id);
  if (result.error) throw new Error(result.error.message);
}

async function getLedgerTransactionRows(accountId: string): Promise<LedgerTransactionRow[]> {
  await requireLedgerAccount(accountId);
  const result = await getAdminClient().from("ledger_transactions").select("*").eq("business_id", BUSINESS_ID).eq("ledger_account_id", accountId).order("date").order("created_at");
  return await ensure(result) as LedgerTransactionRow[];
}

async function recalculateLedgerBalances(accountId: string): Promise<void> {
  const rows = await getLedgerTransactionRows(accountId);
  let running = 0;
  for (const row of rows) {
    running += row.debit - row.credit;
    if (row.balance !== running) {
      const result = await getAdminClient().from("ledger_transactions").update({ balance: running }).eq("business_id", BUSINESS_ID).eq("id", row.id);
      if (result.error) throw new Error(result.error.message);
    }
  }
}

export async function listLedgerTransactions(accountId: string): Promise<LedgerTransaction[]> {
  return (await getLedgerTransactionRows(accountId)).map(transactionFromRow);
}

export async function getLedgerAccountSummary(accountId: string, fromDate?: string, toDate?: string) {
  const transactions = (await getLedgerTransactionRows(accountId)).map(transactionFromRow).filter((transaction) => {
    const time = new Date(transaction.date).getTime();
    return (!fromDate || time >= new Date(fromDate).getTime()) && (!toDate || time <= new Date(`${toDate}T23:59:59`).getTime());
  });
  let running = 0;
  const adjusted = transactions.map((transaction) => {
    running += transaction.debit - transaction.credit;
    return { ...transaction, balance: running };
  });
  return {
    totalDebit: adjusted.reduce((sum, transaction) => sum + transaction.debit, 0),
    totalCredit: adjusted.reduce((sum, transaction) => sum + transaction.credit, 0),
    currentBalance: adjusted.reduce((sum, transaction) => sum + transaction.debit - transaction.credit, 0),
    totalTransactions: adjusted.length,
    transactions: adjusted,
  };
}

async function createLedgerTransactionInternal(accountId: string, input: Omit<LedgerTransaction, "id" | "ledgerAccountId" | "createdAt" | "updatedAt"> & { billId?: string }): Promise<LedgerTransaction> {
  await requireLedgerAccount(accountId);
  const now = new Date().toISOString();
  const row = {
    id: crypto.randomUUID(),
    ledger_account_id: accountId,
    business_id: BUSINESS_ID,
    bill_id: input.billId ?? null,
    date: input.date,
    voucher_number: input.voucherNumber ?? null,
    payment_mode: input.paymentMode ?? null,
    description: input.description,
    debit: input.debit,
    credit: input.credit,
    balance: 0,
    transaction_type: input.transactionType,
    created_at: now,
    updated_at: now,
  };
  const result = await getAdminClient().from("ledger_transactions").insert(row).select("*").single();
  const transaction = transactionFromRow(await ensure(result) as LedgerTransactionRow);
  await recalculateLedgerBalances(accountId);
  return transaction;
}

export async function createLedgerTransaction(accountId: string, input: Omit<LedgerTransaction, "id" | "ledgerAccountId" | "createdAt" | "updatedAt">): Promise<LedgerTransaction> {
  return createLedgerTransactionInternal(accountId, input);
}

export async function updateLedgerTransaction(id: string, patch: Partial<LedgerTransaction>): Promise<LedgerTransaction> {
  const existingResult = await getAdminClient().from("ledger_transactions").select("*").eq("business_id", BUSINESS_ID).eq("id", id).single();
  const existing = transactionFromRow(await ensure(existingResult) as LedgerTransactionRow);
  const accountId = patch.ledgerAccountId ?? existing.ledgerAccountId;
  await requireLedgerAccount(accountId);
  const values: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.ledgerAccountId !== undefined) values.ledger_account_id = patch.ledgerAccountId;
  if (patch.billId !== undefined) values.bill_id = patch.billId ?? null;
  if (patch.date !== undefined) values.date = patch.date;
  if (patch.voucherNumber !== undefined) values.voucher_number = patch.voucherNumber ?? null;
  if (patch.paymentMode !== undefined) values.payment_mode = patch.paymentMode ?? null;
  if (patch.description !== undefined) values.description = patch.description;
  if (patch.debit !== undefined) values.debit = patch.debit;
  if (patch.credit !== undefined) values.credit = patch.credit;
  if (patch.transactionType !== undefined) values.transaction_type = patch.transactionType;
  const result = await getAdminClient().from("ledger_transactions").update(values).eq("business_id", BUSINESS_ID).eq("id", id).select("*").single();
  const transaction = transactionFromRow(await ensure(result) as LedgerTransactionRow);
  await recalculateLedgerBalances(existing.ledgerAccountId);
  if (transaction.ledgerAccountId !== existing.ledgerAccountId) await recalculateLedgerBalances(transaction.ledgerAccountId);
  return transaction;
}

export async function deleteLedgerTransaction(id: string): Promise<void> {
  const existingResult = await getAdminClient().from("ledger_transactions").select("ledger_account_id").eq("business_id", BUSINESS_ID).eq("id", id).single();
  const existing = await ensure(existingResult) as { ledger_account_id: string };
  const result = await getAdminClient().from("ledger_transactions").delete().eq("business_id", BUSINESS_ID).eq("id", id);
  if (result.error) throw new Error(result.error.message);
  await recalculateLedgerBalances(existing.ledger_account_id);
}

export async function syncBillToLedger(bill: Bill, accountId: string): Promise<void> {
  const account = await requireLedgerAccount(accountId);
  const cloudBill = await requireBillForBusiness(bill.id);
  if (cloudBill.ledgerAccountId !== account.id) throw new Error("Bill and Ledger account ownership mismatch.");
  const existingResult = await getAdminClient().from("ledger_transactions").select("*").eq("business_id", BUSINESS_ID).eq("bill_id", bill.id).eq("transaction_type", "bill").maybeSingle();
  if (existingResult.error) throw new Error(existingResult.error.message);
  const existing = existingResult.data as LedgerTransactionRow | null;
  if (existing && existing.ledger_account_id !== account.id) {
    const removed = await getAdminClient().from("ledger_transactions").delete().eq("business_id", BUSINESS_ID).eq("id", existing.id);
    if (removed.error) throw new Error(removed.error.message);
    await recalculateLedgerBalances(existing.ledger_account_id);
  }
  const now = new Date().toISOString();
  const result = await getAdminClient().from("ledger_transactions").upsert({
    id: existing?.ledger_account_id === account.id ? existing.id : crypto.randomUUID(),
    ledger_account_id: account.id,
    business_id: BUSINESS_ID,
    bill_id: bill.id,
    date: bill.date,
    voucher_number: String(bill.serialNumber),
    payment_mode: "-",
    description: `Bill Generated — Bill #${bill.serialNumber}`,
    debit: bill.totalAmount,
    credit: 0,
    balance: 0,
    transaction_type: "bill",
    created_at: existing?.created_at ?? now,
    updated_at: now,
  }).select("*").single();
  await ensure(result);
  await recalculateLedgerBalances(account.id);
}

export async function removeBillFromLedger(bill: Bill, accountId: string): Promise<void> {
  await requireLedgerAccount(accountId);
  await requireBillForBusiness(bill.id);
  const result = await getAdminClient().from("ledger_transactions").delete().eq("business_id", BUSINESS_ID).eq("ledger_account_id", accountId).eq("bill_id", bill.id);
  if (result.error) throw new Error(result.error.message);
  await recalculateLedgerBalances(accountId);
}
