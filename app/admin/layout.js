import { requireAdmin } from "@/lib/dal";
import PanelShell from "@/components/ui/panel-shell";

export const metadata = { title: { default: "Admin", template: "%s | Admin" } };

const AdminGuard = async ({ children }) => {
  await requireAdmin();
  return children;
};

const AdminLayout = ({ children }) => (
  <PanelShell panel="admin" guard={AdminGuard}>
    {children}
  </PanelShell>
);

export default AdminLayout;
