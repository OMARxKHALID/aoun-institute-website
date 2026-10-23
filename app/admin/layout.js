import { requireStaff } from "@/lib/dal";
import PanelShell from "@/components/ui/panel-shell";

export const metadata = { robots: { index: false, follow: false }, title: { default: "Admin", template: "%s | Admin" } };

const AdminGuard = async ({ children }) => {
  await requireStaff();
  return children;
};

const AdminLayout = ({ children }) => (
  <PanelShell panel="admin" guard={AdminGuard}>
    {children}
  </PanelShell>
);

export default AdminLayout;
