import { InquiryManager } from "@/components/admin/InquiryManager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  await requireAdmin();

  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });

  const serialized = inquiries.map((inquiry) => ({
    ...inquiry,
    createdAt: inquiry.createdAt.toISOString(),
  }));

  return <InquiryManager inquiries={serialized} />;
}
