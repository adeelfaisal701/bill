import { repositories } from "@/repositories";
import type { BusinessProfile } from "@/types/business";

export interface CompanyOption {
  id: string;
  name: string;
}

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  return repositories.business.getProfile();
}

export async function listCompanyOptions(): Promise<CompanyOption[]> {
  const billTypes = await repositories.bills.getBillTypes();
  return billTypes.map((billType) => ({
    id: billType.id,
    name: billType.name,
  }));
}

export async function saveBusinessProfile(
  profile: Omit<BusinessProfile, "updatedAt">
): Promise<BusinessProfile> {
  return repositories.business.saveProfile({
    ...profile,
    updatedAt: new Date().toISOString(),
  });
}
