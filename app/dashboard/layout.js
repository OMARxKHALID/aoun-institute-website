import { requireUser } from "@/lib/dal";
import PanelShell from "@/components/ui/panel-shell";

export const metadata = { title: { default: "Dashboard", template: "%s | Dashboard" } };

const StudentGuard = async ({ children }) => {
  await requireUser();
  return children;
};

const DashboardLayout = ({ children }) => (
  <PanelShell panel="student" guard={StudentGuard}>
    {children}
  </PanelShell>
);

export default DashboardLayout;
