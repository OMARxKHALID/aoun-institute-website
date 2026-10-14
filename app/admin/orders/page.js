import { getAdminOrders } from "@/features/payments/queries";
import OrderTable from "@/features/payments/components/order-table";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Orders" };

const AdminOrdersPage = async ({ searchParams }) => {
  const [{ q = "" }, orders] = await Promise.all([searchParams, getAdminOrders()]);
  const pending = orders.filter((o) => o.status === "PENDING").length;
  return (
    <>
      <PanelHeader title="Orders" subtitle={pending ? `${pending} ${pending === 1 ? "payment" : "payments"} waiting for review` : "All payments are reviewed"} />
      <div className="p-4 sm:p-5 lg:p-8">
        <OrderTable orders={orders} initialSearch={q} />
      </div>
    </>
  );
};

export default AdminOrdersPage;
