// Clearly isolated development seed data. Never imported by the cloud
// repository — only used to make the mock repository feel real during
// local development (see requirement #25 in the product spec).

import type { Bill, BillType } from "@/types/bill";
import type { Product } from "@/types/product";

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();

export const SEED_BILL_TYPES: BillType[] = [
  { id: "type-1", name: "SHAREEF TRADERS", formatKey: "type-1", lastSerialNumber: 2 },
  { id: "type-2", name: "AL-GHANI TRADERS", formatKey: "type-2", lastSerialNumber: 2 },
];

export const SEED_PRODUCTS: Product[] = [
  { id: "p_cement", name: "Cement", costPrice: 1200, stockQuantity: 50, isActive: true, createdAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: "p_steel", name: "Steel Rod", costPrice: 1100, stockQuantity: 100, isActive: true, createdAt: daysAgo(28), updatedAt: daysAgo(28) },
  { id: "p_bricks", name: "Bricks", stockQuantity: 500, isActive: false, createdAt: daysAgo(20), updatedAt: daysAgo(5) },
  { id: "p_sand", name: "Sand (per truck)", stockQuantity: 10, isActive: true, createdAt: daysAgo(15), updatedAt: daysAgo(15) },
];

export const SEED_BILLS: Bill[] = [
  {
    id: "b_1",
    billType: "type-1",
    serialNumber: 1,
    partyName: "ABC Traders",
    date: daysAgo(1),
    items: [
      {
        id: "bi_1",
        billId: "b_1",
        productId: "p_cement",
        productNameSnapshot: "Cement",
        quantity: 8,
        rate: 1500,
        amount: 12000,
      },
    ],
    subtotal: 12000,
    totalAmount: 12000,
    status: "saved",
    paymentStatus: "paid",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "b_2",
    billType: "type-2",
    serialNumber: 1,
    partyName: "XYZ Traders",
    date: daysAgo(0),
    items: [
      {
        id: "bi_2a",
        billId: "b_2",
        productId: "p_steel",
        productNameSnapshot: "Steel Rod",
        quantity: 12,
        rate: 1400,
        amount: 16800,
      },
      {
        id: "bi_2b",
        billId: "b_2",
        productId: "p_sand",
        productNameSnapshot: "Sand (per truck)",
        quantity: 1,
        rate: 1700,
        amount: 1700,
      },
    ],
    subtotal: 18500,
    totalAmount: 18500,
    status: "saved",
    paymentStatus: "pending",
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
];
