import { repositories } from "@/repositories";
import type { Bill, BillFilters, CreateBillInput, UpdateBillInput } from "@/types/bill";
import { isSameDay } from "@/lib/utilities";
import { validateBillDraft } from "@/lib/validation";

export async function listBills(): Promise<Bill[]> {
  return repositories.bills.listBills();
}

export async function getBill(id: string): Promise<Bill | null> {
  return repositories.bills.getBill(id);
}

export async function getBillTypes() {
  return repositories.bills.getBillTypes();
}

export async function getNextBillNumber(): Promise<number> {
  return repositories.bills.getNextBillNumber();
}

export function filterBills(bills: Bill[], filters: BillFilters): Bill[] {
  let result = bills;
  if (filters.billType && filters.billType !== "all") {
    result = result.filter((b) => b.billType === filters.billType);
  }
  const q = filters.query?.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (b) =>
        b.partyName.toLowerCase().includes(q) ||
        String(b.serialNumber).includes(q)
    );
  }
  return result;
}

export async function createBill(input: CreateBillInput): Promise<Bill> {
  const errors = validateBillDraft({
    partyName: input.partyName,
    items: input.items.map((i) => ({
      productNameSnapshot: i.productNameSnapshot,
      quantity: i.quantity,
      rate: i.rate,
    })),
  });
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors)[0]);
  }
  const bill = await repositories.bills.createBill(input);
  
  // Deduct stock for each item
  for (const item of bill.items) {
    if (item.productId) {
      const product = await repositories.products.getProduct(item.productId);
      if (product) {
        await repositories.products.updateProduct(item.productId, {
          stockQuantity: (product.stockQuantity ?? 0) - item.quantity,
        });
      }
    }
  }

  return bill;
}

export async function deleteBill(id: string): Promise<void> {
  const bill = await repositories.bills.getBill(id);
  if (bill) {
    // Restore stock for each item
    for (const item of bill.items) {
      if (item.productId) {
        const product = await repositories.products.getProduct(item.productId);
        if (product) {
          await repositories.products.updateProduct(item.productId, {
            stockQuantity: (product.stockQuantity ?? 0) + item.quantity,
          });
        }
      }
    }
  }
  return repositories.bills.deleteBill(id);
}

export async function updateBill(id: string, input: UpdateBillInput): Promise<Bill> {
  const existingBill = await repositories.bills.getBill(id);
  if (!existingBill) throw new Error("Bill not found.");

  if (input.items) {
    for (const item of existingBill.items) {
      if (item.productId) {
        const product = await repositories.products.getProduct(item.productId);
        if (product) {
          await repositories.products.updateProduct(item.productId, {
            stockQuantity: (product.stockQuantity ?? 0) + item.quantity,
          });
        }
      }
    }
    for (const item of input.items) {
      if (item.productId) {
        const product = await repositories.products.getProduct(item.productId);
        if (product) {
          await repositories.products.updateProduct(item.productId, {
            stockQuantity: (product.stockQuantity ?? 0) - item.quantity,
          });
        }
      }
    }
  }

  return repositories.bills.updateBill(id, input);
}

export interface DashboardStats {
  todaysTotal: number;
  todaysBillCount: number;
  recentBills: Bill[];
  totalSales: number;
  totalReceived: number;
  totalPending: number;
}

export function computeDashboardStats(bills: Bill[]): DashboardStats {
  const today = new Date().toISOString();
  const todaysBills = bills.filter((b) => isSameDay(b.createdAt, today));
  const recentBills = [...bills]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const savedBills = bills.filter(b => b.status === "saved");
  
  const totalSales = savedBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalReceived = savedBills
    .filter(b => b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPending = savedBills
    .filter(b => b.paymentStatus === "Pending")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return {
    todaysTotal: todaysBills.reduce((sum, b) => sum + b.totalAmount, 0),
    todaysBillCount: todaysBills.length,
    recentBills,
    totalSales,
    totalReceived,
    totalPending,
  };
}
