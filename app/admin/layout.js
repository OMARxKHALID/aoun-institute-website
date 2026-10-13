import { Suspense } from "react";
import { requireAdmin } from "@/lib/dal";
import PanelNav from "@/components/ui/panel-nav";
import PanelSkeleton from "@/components/ui/panel-skeleton";

export const metadata = { title: { default: "Admin", template: "%s | Admin" } };

const AdminGuard = async ({ children }) => {
  await requireAdmin();
  return children;
};

const AdminLayout = ({ children }) => (
  <div className="min-h-screen lg:flex">
    <PanelNav panel="admin" title="Admin" />
    <main className="min-w-0 flex-1">
      <Suspense fallback={<PanelSkeleton />}>
        <AdminGuard>{children}</AdminGuard>
      </Suspense>
    </main>
  </div>
);

export default AdminLayout;
