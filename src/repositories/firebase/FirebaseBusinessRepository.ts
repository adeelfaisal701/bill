import type { BusinessRepository } from "@/repositories/interfaces";
import { CloudNotConfiguredError } from "./NotConfiguredError";

export class FirebaseBusinessRepository implements BusinessRepository {
  async getProfile(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud business profile sync");
  }
  async saveProfile(): Promise<never> {
    throw new CloudNotConfiguredError("Cloud business profile sync");
  }
}
