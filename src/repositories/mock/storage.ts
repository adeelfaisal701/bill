// Thin localStorage wrapper used ONLY by the mock repositories. This is
// clearly isolated dev/demo storage — it is not "the database" and is not
// meant to be relied on as the permanent solution (see repositories/index.ts
// and docs/ARCHITECTURE.md).

const NAMESPACE = "billmanager.mock.v1";

function key(name: string): string {
  return `${NAMESPACE}.${name}`;
}

export function readAll<T>(name: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(key(name));
    if (raw) return JSON.parse(raw) as T;
    window.localStorage.setItem(key(name), JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}

export function writeAll<T>(name: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // storage unavailable — mock repository silently no-ops
  }
}
