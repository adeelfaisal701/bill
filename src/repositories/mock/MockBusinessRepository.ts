import type { BusinessRepository } from "@/repositories/interfaces";
import type { BusinessProfile } from "@/types/business";
import { readAll, writeAll } from "./storage";

const BUSINESS_KEY = "business";

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class MockBusinessRepository implements BusinessRepository {
  async getProfile(): Promise<BusinessProfile | null> {
    return delay(readAll<BusinessProfile | null>(BUSINESS_KEY, null));
  }

  async saveProfile(profile: BusinessProfile): Promise<BusinessProfile> {
    const now = new Date().toISOString();
    const updated: BusinessProfile = { ...profile, updatedAt: now };
    writeAll(BUSINESS_KEY, updated);
    return delay(updated);
  }
}
