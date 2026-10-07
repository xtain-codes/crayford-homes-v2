import { GalleryManager } from "@/components/admin/GalleryManager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireAdmin();

  const images = await prisma.galleryImage.findMany({ orderBy: { displayOrder: "asc" } });

  return <GalleryManager images={images} />;
}
