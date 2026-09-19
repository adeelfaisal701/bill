// The ONLY place the app decides which concrete repository implementation
// to use. Everything else (services, hooks, components) imports from here
// or from ./interfaces — never directly from ./mock or ./firebase.
//
// Today: always mock, because Firebase is not configured in this build.
// Once NEXT_PUBLIC_FIREBASE_* env vars are set AND the Firebase*Repository
// classes are fully implemented (see the STUB comments in ./firebase),
// flip USE_CLOUD_WHEN_CONFIGURED to true to switch automatically.

import type { DataRepositories } from "./interfaces";
import { isFirebaseConfigured } from "./firebase/config";
import { MockBillRepository } from "./mock/MockBillRepository";
import { MockProductRepository } from "./mock/MockProductRepository";
import { MockBusinessRepository } from "./mock/MockBusinessRepository";
import { MockAuthRepository } from "./mock/MockAuthRepository";
import { FirebaseBillRepository } from "./firebase/FirebaseBillRepository";
import { FirebaseProductRepository } from "./firebase/FirebaseProductRepository";
import { FirebaseBusinessRepository } from "./firebase/FirebaseBusinessRepository";
import { FirebaseAuthRepository } from "./firebase/FirebaseAuthRepository";
import { isSupabaseConfigured } from "./supabase/config";
import { SupabaseBillRepository, SupabaseProductRepository } from "./supabase/http";

const useCloud = isSupabaseConfigured;

export const repositories: DataRepositories = useCloud
  ? {
  bills: new SupabaseBillRepository(),
  products: new SupabaseProductRepository(),
      business: new FirebaseBusinessRepository(),
      auth: new FirebaseAuthRepository(),
      mode: "cloud",
    }
  : {
      bills: new MockBillRepository(),
      products: new MockProductRepository(),
      business: new MockBusinessRepository(),
      auth: new MockAuthRepository(),
      mode: "mock",
    };
