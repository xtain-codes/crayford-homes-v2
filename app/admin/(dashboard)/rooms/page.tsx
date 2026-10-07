import { RoomManager } from "@/components/admin/RoomManager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminRoomsPage() {
  await requireAdmin();

  const rooms = await prisma.room.findMany({ orderBy: { displayOrder: "asc" } });

  return <RoomManager rooms={rooms} />;
}
