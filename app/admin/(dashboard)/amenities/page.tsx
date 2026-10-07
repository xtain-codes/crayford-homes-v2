import { AmenityManager } from "@/components/admin/AmenityManager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAmenitiesPage() {
  await requireAdmin();

  const amenities = await prisma.amenity.findMany({ orderBy: { displayOrder: "asc" } });

  return <AmenityManager amenities={amenities} />;
}
