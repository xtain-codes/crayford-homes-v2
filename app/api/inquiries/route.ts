import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { inquirySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/**
 * POST /api/inquiries — contact/booking enquiries from the public site.
 * Stored in the DB and surfaced in the admin dashboard.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid inquiry." },
      { status: 400 }
    );
  }

  try {
    const inquiry = await prisma.inquiry.create({ data: parsed.data });
    return NextResponse.json({ ok: true, id: inquiry.id });
  } catch (error) {
    console.error("POST /api/inquiries failed:", error);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 }
    );
  }
}
