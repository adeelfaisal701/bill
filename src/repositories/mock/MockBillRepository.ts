import type { BillRepository } from "@/repositories/interfaces";
import type { Bill, BillType, BillTypeId, CreateBillInput, UpdateBillInput } from "@/types/bill";
import { readAll, writeAll } from "./storage";
import { SEED_BILLS, SEED_BILL_TYPES } from "./mockData";
import { generateId } from "@/lib/utilities";

const BILLS_KEY = "bills";
const BILL_TYPES_KEY = "billTypes";
const GLOBAL_BILL_NUMBER_KEY = "globalBillNumber";

function loadBills(): Bill[] {
  const bills = readAll<Bill[]>(BILLS_KEY, SEED_BILLS);
  let migrated = false;
  const migratedBills = bills.map(bill => {
    if (!bill.paymentStatus) {
      migrated = true;
      return { ...bill, paymentStatus: "pending" as const };
    }
    // Also normalize any old capitalized statuses
    const rawStatus = bill.paymentStatus as string;
    if (rawStatus === "Pending" || rawStatus === "Paid") {
      migrated = true;
      return { ...bill, paymentStatus: rawStatus.toLowerCase() as Bill["paymentStatus"] };
    }
    return bill;
  });
  if (migrated) {
    saveBills(migratedBills);
  }
  return migratedBills;
}
function saveBills(bills: Bill[]): void {
  writeAll(BILLS_KEY, bills);
}
function loadBillTypes(): BillType[] {
  return readAll<BillType[]>(BILL_TYPES_KEY, SEED_BILL_TYPES);
}
function saveBillTypes(types: BillType[]): void {
  writeAll(BILL_TYPES_KEY, types);
}

function calculateNextBillNumber(): number {
  const storedNext = readAll<number | null>(GLOBAL_BILL_NUMBER_KEY, null);
  const highestExistingNumber = loadBills().reduce((highest, bill) => {
    const billNumber = Number(bill.billNumber ?? bill.serialNumber);
    return Number.isInteger(billNumber) && billNumber > highest ? billNumber : highest;
  }, 0);
  return Math.max(storedNext ?? 1, highestExistingNumber + 1);
}

// Simulates network latency so loading states are visible/testable.
function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class MockBillRepository implements BillRepository {
  async listBills(): Promise<Bill[]> {
    return delay([...loadBills()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async getBill(id: string): Promise<Bill | null> {
    const bill = loadBills().find((b) => b.id === id) ?? null;
    return delay(bill);
  }

  async createBill(input: CreateBillInput): Promise<Bill> {
    const serialNumber = await this.reserveNextSerialNumber(input.billType);
    const now = new Date().toISOString();
    const billId = generateId("bill");

    const items = input.items.map((item) => ({
      id: generateId("item"),
      billId,
      productId: item.productId,
      productNameSnapshot: item.productNameSnapshot,
      quantity: item.quantity,
      rate: item.rate,
      amount: Math.round(item.quantity * item.rate * 100) / 100,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);

    const bill: Bill = {
      id: billId,
      billType: input.billType,
      serialNumber,
      billNumber: String(serialNumber),
      partyName: input.partyName.trim(),
      partyPhone: input.partyPhone?.trim() || undefined,
      partyAddress: input.partyAddress?.trim() || undefined,
      date: input.date,
      items,
      subtotal,
      totalAmount: subtotal,
      notes: input.notes?.trim() || undefined,
      status: "saved",
      paymentStatus: input.paymentStatus ?? "pending",
      createdAt: now,
      updatedAt: now,
    };

    const bills = loadBills();
    bills.push(bill);
    saveBills(bills);

    return delay(bill);
  }

  async updateBill(id: string, patch: UpdateBillInput): Promise<Bill> {
    const bills = loadBills();
    const idx = bills.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Bill not found.");

    const existing = bills[idx];
    
    let updatedItems = existing.items;
    let subtotal = existing.subtotal;
    
    if (patch.items) {
      updatedItems = patch.items.map((item) => ({
        id: item.id ?? generateId("item"),
        billId: existing.id,
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        quantity: item.quantity,
        rate: item.rate,
        amount: Math.round(item.quantity * item.rate * 100) / 100,
      }));
      subtotal = updatedItems.reduce((sum, i) => sum + i.amount, 0);
    }

    const updated: Bill = {
      ...existing,
      ...patch,
      partyName: patch.partyName ?? existing.partyName,
      partyPhone: patch.partyPhone !== undefined ? patch.partyPhone : existing.partyPhone,
      partyAddress: patch.partyAddress !== undefined ? patch.partyAddress : existing.partyAddress,
      date: patch.date ?? existing.date,
      items: updatedItems,
      subtotal,
      totalAmount: subtotal,
      notes: patch.notes !== undefined ? patch.notes : existing.notes,
      paymentStatus: patch.paymentStatus ?? existing.paymentStatus,
      updatedAt: new Date().toISOString(),
    };

    bills[idx] = updated;
    saveBills(bills);
    return delay(updated);
  }

  async deleteBill(id: string): Promise<void> {
    saveBills(loadBills().filter((b) => b.id !== id));
    return delay(undefined);
  }

  async getBillTypes(): Promise<BillType[]> {
    return delay(loadBillTypes());
  }

  async getNextBillNumber(): Promise<number> {
    return calculateNextBillNumber();
  }

  async reserveNextSerialNumber(billType: BillTypeId): Promise<number> {
    void billType;
    const nextSerial = calculateNextBillNumber();
    writeAll(GLOBAL_BILL_NUMBER_KEY, nextSerial + 1);
    return delay(nextSerial, 0);
  }
}
