import type { AuthRepository } from "@/repositories/interfaces";
import type { AppUser } from "@/types/user";
import { readAll, writeAll } from "./storage";
import { generateId } from "@/lib/utilities";

const USER_KEY = "currentUser";

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Demo-only auth so the app shell and protected routes can be built and
// tested before a real auth provider (e.g. Firebase Auth) is wired up.
// See docs/ARCHITECTURE.md for what changes when that happens.
export class MockAuthRepository implements AuthRepository {
  async getCurrentUser(): Promise<AppUser | null> {
    return delay(readAll<AppUser | null>(USER_KEY, null));
  }

  async signIn(email: string): Promise<AppUser> {
    const user: AppUser = { id: generateId("user"), name: email.split("@")[0], email };
    writeAll(USER_KEY, user);
    return delay(user);
  }

  async signUp(name: string, email: string): Promise<AppUser> {
    const user: AppUser = { id: generateId("user"), name, email };
    writeAll(USER_KEY, user);
    return delay(user);
  }

  async signOut(): Promise<void> {
    writeAll(USER_KEY, null);
    return delay(undefined);
  }
}
