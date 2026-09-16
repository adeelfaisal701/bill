import type { AppUser } from "@/types/user";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload?.message || "Authentication failed.");
  }

  return payload;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const payload = await requestJson<{ user: AppUser | null } | { user?: AppUser | null }>('/api/auth/session');
  return payload.user ?? null;
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  const payload = await requestJson<{ user: AppUser; message?: string }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return payload.user;
}

export async function signUp(): Promise<AppUser> {
  throw new Error('Account creation is disabled.');
}

export async function signOut(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
  });
}
