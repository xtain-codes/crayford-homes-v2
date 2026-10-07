import "server-only";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

/**
 * Admin authentication — server-side only.
 *
 * Sessions are stateless and tamper-proof: the cookie holds the admin's id +
 * email signed with an HMAC (AUTH_SECRET). There is nothing to decrypt and no
 * session store; verifying the signature is the whole check. Cookies are
 * HTTP-only (invisible to JS), SameSite=Lax, and expire after 7 days.
 *
 * Every protected admin page calls requireAdmin() in a server component, and
 * every admin API route calls getAdminFromRequest() — hiding UI is never the
 * security boundary.
 */

const COOKIE_NAME = "crayford_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

export type AdminSession = { id: string; email: string };

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Add it to .env.local (see README).");
  }
  return secret;
}

/** Signs "id.email.expiry" with an HMAC-SHA256. */
function sign(payload: string): string {
  return crypto.createHmac("sha256", authSecret()).update(payload).digest("hex");
}

function createToken(session: AdminSession): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  // base64url keeps the email dot-free so the token is always exactly 4
  // dot-separated parts (emails like admin@crayford.local contain dots).
  const email = Buffer.from(session.email, "utf8").toString("base64url");
  const payload = `${session.id}.${email}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): AdminSession | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [id, emailB64, expiresAt, signature] = parts;
  const payload = `${id}.${emailB64}.${expiresAt}`;
  const expected = sign(payload);
  // Timing-safe comparison — never use === on signatures.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (!Number.isFinite(Number(expiresAt)) || Date.now() > Number(expiresAt)) return null;
  let email: string;
  try {
    email = Buffer.from(emailB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  return { id, email };
}

export function createSessionCookieValue(session: AdminSession): string {
  return createToken(session);
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  },
};

/** Verifies credentials against the database. Never leaks which part failed. */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminSession | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const admin = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
  if (!admin) {
    // Burn comparable time so a missing email is indistinguishable from a
    // wrong password by timing.
    await bcrypt.compare(password, "$2a$12$C6UzMDM.H6dfI/f/IKcEeO4rZk1gA0vNkQ7J1xQmZKJqZ0fB6iVxu");
    return null;
  }
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;
  return { id: admin.id, email: admin.email };
}

/** Reads + validates the session from the Next.js cookie store (server side). */
export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** For API routes: returns the session or null. */
export function getAdminFromRequest(request: Request): AdminSession | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return verifyToken(decodeURIComponent(match.slice(COOKIE_NAME.length + 1)));
}

/** Throws a redirect to /admin/login when there is no valid session. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }
  // redirect() throws, so session is non-null here; the assertion keeps TS happy.
  return session as AdminSession;
}

/** JSON 401 response for API routes when unauthenticated. */
export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "Authentication required." }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
