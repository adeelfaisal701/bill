export type LedgerAccountType = "Customer" | "Supplier" | "Society / Company" | "Other";
export type OpeningBalanceType = "debit" | "credit";

export interface LedgerAccount {
  id: string;
  name: string;
  accountCode?: string;
  type: LedgerAccountType;
  companyId?: string; // Company / Bill Type (e.g. type-1, type-2)
  contactDetails?: string;
  projectName?: string;
  projectCode?: string;
  taxEnabled: boolean;
  taxName?: string;
  taxRate?: number;
  openingBalance: number;
  openingBalanceType: OpeningBalanceType;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerTransaction {
  id: string;
  ledgerAccountId: string;
  billId?: string;
  date: string;
  voucherNumber?: string;
  paymentMode?: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  transactionType: "bill" | "payment" | "opening" | "manual";
  createdAt: string;
  updatedAt: string;
}

export interface CreateLedgerAccountInput {
  name: string;
  accountCode?: string;
  type?: LedgerAccountType;
  companyId?: string;
  contactDetails?: string;
  projectName?: string;
  projectCode?: string;
  taxEnabled?: boolean;
  taxName?: string;
  taxRate?: number;
  openingBalance?: number;
  openingBalanceType?: OpeningBalanceType;
}

export interface UpdateLedgerAccountInput extends Partial<CreateLedgerAccountInput> {}
