import { Suspense } from "react";
import { requireUser } from "@/lib/dal";
import PanelNav from "@/components/ui/panel-nav";
import PanelSkeleton from "@/components/ui/panel-skeleton";

export const metadata = { title: { default: "Dashboard", template: "%s | Dashboard" } };

const StudentGuard = async ({ children }) => {
  await requireUser();
  return children;
};

const DashboardLayout = ({ children }) => (
  <div className="min-h-screen lg:flex">
    <PanelNav panel="student" title="My Learning" />
    <main className="min-w-0 flex-1">
      <Suspense fallback={<PanelSkeleton />}>
        <StudentGuard>{children}</StudentGuard>
      </Suspense>
    </main>
  </div>
);

export default DashboardLayout;
