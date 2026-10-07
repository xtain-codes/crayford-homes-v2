import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

/**
 * Admin shell — every page under this layout is server-guarded: no valid
 * session cookie means redirect to /admin/login before anything renders.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-charcoal">
      <AdminSidebar sessionEmail={session.email} />
      <div className="lg:pl-64">
        <AdminHeader sessionEmail={session.email} />
        <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
