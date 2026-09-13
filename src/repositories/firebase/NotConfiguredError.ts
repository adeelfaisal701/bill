export class CloudNotConfiguredError extends Error {
  constructor(feature: string) {
    super(
      `${feature} requires Firebase to be configured. Add the NEXT_PUBLIC_FIREBASE_* ` +
        `environment variables (see .env.example) and restart the app.`
    );
    this.name = "CloudNotConfiguredError";
  }
}
