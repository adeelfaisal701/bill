import { repositories } from "@/repositories";
import type { AppUser } from "@/types/user";

export async function getCurrentUser(): Promise<AppUser | null> {
  return repositories.auth.getCurrentUser();
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  return repositories.auth.signIn(email, password);
}

export async function signUp(name: string, email: string, password: string): Promise<AppUser> {
  return repositories.auth.signUp(name, email, password);
}

export async function signOut(): Promise<void> {
  return repositories.auth.signOut();
}
