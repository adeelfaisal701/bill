// STUB. Real Firestore reads/writes/transactions are not implemented yet —
// implementing them without a configured Firebase project would mean either
// crashing at import time or silently behaving like the mock, both of which
// hide the distinction the spec requires between "configured" and "future
// integration" (section 15). Every method fails loudly and clearly instead.
//
// To implement this for real: initialize the Firebase app from
// repositories/firebase/config.ts, then implement each method against
// Firestore collections (e.g. `bills`, `billTypes`), using a Firestore
// transaction for reserveNextSerialNumber so concurrent devices can never
// receive the same serial number for the same bill type.

import type { BillRepository } from "@/repositories/interfaces";
import { CloudNotConfiguredError } from "./NotConfiguredError";

export class FirebaseBillRepository implements BillRepository {
  async listBills(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud bill sync");
  }
  async getBill(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud bill sync");
  }
  async createBill(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud bill sync");
  }
  async updateBill(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud bill sync");
  }
  async deleteBill(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud bill sync");
  }
  async getBillTypes(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud bill sync");
  }
  async getNextBillNumber(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud bill sync");
  }
  async reserveNextSerialNumber(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud bill sync");
  }
}
