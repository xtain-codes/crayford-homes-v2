import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const rows = await prisma.siteSetting.findMany();
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return <SettingsEditor settings={settings} />;
}
