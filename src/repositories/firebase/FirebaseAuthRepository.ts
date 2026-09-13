import type { AuthRepository } from "@/repositories/interfaces";
import { CloudNotConfiguredError } from "./NotConfiguredError";

export class FirebaseAuthRepository implements AuthRepository {
  async getCurrentUser(): Promise<never> {
    throw new CloudNotConfiguredError("Firebase Authentication");
  }
  async signIn(): Promise<never> {
    throw new CloudNotConfiguredError("Firebase Authentication");
  }
  async signUp(): Promise<never> {
    throw new CloudNotConfiguredError("Firebase Authentication");
  }
  async signOut(): Promise<never> {
    throw new CloudNotConfiguredError("Firebase Authentication");
  }
}
