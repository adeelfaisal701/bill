import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Bill, BillItem, BillType, BillTypeId, CreateBillInput, UpdateBillInput } from "@/types/bill";
import type { CreateProductInput, Product, UpdateProductInput } from "@/types/product";

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
  await ensure(result);
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
