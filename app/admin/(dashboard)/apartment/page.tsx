import { ApartmentEditor } from "@/components/admin/ApartmentEditor";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminApartmentPage() {
  await requireAdmin();

  const apartments = await prisma.apartment.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return <ApartmentEditor apartments={apartments} />;
}
