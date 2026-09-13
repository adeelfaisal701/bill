// STUB — see FirebaseBillRepository.ts for why these throw instead of
// silently falling back to mock behavior.
import type { ProductRepository } from "@/repositories/interfaces";
import { CloudNotConfiguredError } from "./NotConfiguredError";

export class FirebaseProductRepository implements ProductRepository {
  async listProducts(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud product sync");
  }
  async getProduct(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud product sync");
  }
  async createProduct(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud product sync");
  }
  async updateProduct(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud product sync");
  }
  async deleteProduct(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud product sync");
  }
}
