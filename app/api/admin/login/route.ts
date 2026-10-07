import { NextResponse } from "next/server";

import {
  createSessionCookieValue,
  sessionCookie,
  verifyAdminCredentials,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 *
 * Verifies credentials and sets the HTTP-only session cookie on the response.
 * A Route Handler (rather than a server action) because cookie setting is
 * fully deterministic here across Next 14 + React 18 — the Set-Cookie header
 * always lands on the response the browser stores.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check your details." },
      { status: 400 }
    );
  }

  const session = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!session) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie.name, createSessionCookieValue(session), sessionCookie.options);
  return response;
}
