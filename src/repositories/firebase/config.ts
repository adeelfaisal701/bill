// Reads Firebase configuration from environment variables ONLY. Nothing here
// is ever hardcoded. If any required variable is missing, isFirebaseConfigured
// is false and repositories/index.ts falls back to the mock repositories
// instead of pretending cloud sync works (see product spec, section 15).

export const firebaseEnvConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured: boolean = Boolean(
  firebaseEnvConfig.apiKey && firebaseEnvConfig.projectId && firebaseEnvConfig.appId
);
