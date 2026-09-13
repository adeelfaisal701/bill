import { repositories } from "@/repositories";
import type { BusinessProfile } from "@/types/business";

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  return repositories.business.getProfile();
}

export async function saveBusinessProfile(
  profile: Omit<BusinessProfile, "updatedAt">
): Promise<BusinessProfile> {
  return repositories.business.saveProfile({
    ...profile,
    updatedAt: new Date().toISOString(),
  });
}
