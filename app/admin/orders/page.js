import { getAdminOrders } from "@/features/payments/queries";
import OrderTable from "@/features/payments/components/order-table";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Orders" };

const AdminOrdersPage = async () => {
  const orders = await getAdminOrders();
  const pending = orders.filter((o) => o.status === "PENDING").length;
  return (
    <>
      <PanelHeader title="Orders" subtitle={pending ? `${pending} payments waiting for review` : "All payments are reviewed"} />
      <div className="p-5 lg:p-8">
        <OrderTable orders={orders} />
      </div>
    </>
  );
};

export default AdminOrdersPage;
