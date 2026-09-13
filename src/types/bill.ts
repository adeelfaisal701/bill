// The IDs remain stable so existing saved bills continue to select their format.
export type BillTypeId = "type-1" | "type-2" | "type-3";

export interface BillType {
  id: BillTypeId;
  name: string;
  formatKey: string;
  lastSerialNumber: number;
}

export interface BillItem {
  id: string;
  billId: string;
  productId: string | null;
  productNameSnapshot: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type BillStatus = "draft" | "saved";

export type PaymentStatus = "Pending" | "Paid";

export interface Bill {
  id: string;
  billType: BillTypeId;
  serialNumber: number;
  billNumber?: string;
  partyName: string;
  partyPhone?: string;
  partyAddress?: string;
  date: string; // ISO date
  items: BillItem[];
  subtotal: number;
  totalAmount: number;
  notes?: string;
  status: BillStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillItemInput {
  productId: string | null;
  productNameSnapshot: string;
  quantity: number;
  rate: number;
}

export interface CreateBillInput {
  billType: BillTypeId;
  partyName: string;
  partyPhone?: string;
  partyAddress?: string;
  date: string;
  items: CreateBillItemInput[];
  notes?: string;
  paymentStatus?: PaymentStatus;
}

export interface UpdateBillItemInput {
  id?: string;
  productId: string | null;
  productNameSnapshot: string;
  quantity: number;
  rate: number;
}

export interface UpdateBillInput {
  partyName?: string;
  partyPhone?: string;
  partyAddress?: string;
  date?: string;
  items?: UpdateBillItemInput[];
  notes?: string;
  paymentStatus?: PaymentStatus;
}

export interface BillFilters {
  query?: string;
  billType?: BillTypeId | "all";
}
