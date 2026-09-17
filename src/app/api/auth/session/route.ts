import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "billbook_session";
const DEFAULT_EMAIL = "ramzaan12@gmail.com";
const FIXED_EMAIL = (process.env.AUTH_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();

export async function GET() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionValue) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const session = JSON.parse(sessionValue) as { userId?: string; email?: string };
    if (session.userId === "fixed-admin" && session.email?.toLowerCase() === FIXED_EMAIL) {
      return NextResponse.json({
        user: {
          id: "fixed-admin",
          name: "Ramzaan",
          email: FIXED_EMAIL,
        },
      });
    }
  } catch {
    // ignore malformed session and force logout
  }

  return NextResponse.json({ user: null }, { status: 200 });
}
