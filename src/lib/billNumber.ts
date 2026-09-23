import type { BillTypeId } from "@/types/bill";

export const BILL_NUMBER_PREFIX: Record<BillTypeId, string> = {
  "type-1": "AS",
  "type-2": "AG",
  "type-3": "KE",
};

export function formatBillNumber(billType: BillTypeId, serialNumber: number): string {
  return `${BILL_NUMBER_PREFIX[billType]} ${serialNumber}`;
}