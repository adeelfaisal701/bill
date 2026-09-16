import { NextResponse } from "next/server";

const SESSION_COOKIE = "billbook_session";
const FIXED_EMAIL = process.env.AUTH_EMAIL?.trim().toLowerCase();
const FIXED_PASSWORD = process.env.AUTH_PASSWORD?.trim();

if (!FIXED_EMAIL || !FIXED_PASSWORD) {
  throw new Error("Authentication is not configured. Ensure AUTH_EMAIL and AUTH_PASSWORD are set.");
}

const FIXED_USER = {
  id: "fixed-admin",
  name: "Ramzaan",
  email: FIXED_EMAIL,
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password || email !== FIXED_EMAIL || password !== FIXED_PASSWORD) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ user: FIXED_USER, message: "Login successful." });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: JSON.stringify({ userId: FIXED_USER.id, email: FIXED_USER.email }),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
