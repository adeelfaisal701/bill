export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: AppUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
}
