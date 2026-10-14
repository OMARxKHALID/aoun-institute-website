import { getMyOrders } from "@/features/payments/queries";
import MyOrdersTable from "@/features/payments/components/my-orders-table";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Orders" };

const OrdersPage = async () => {
  const orders = await getMyOrders();
  return (
    <>
      <PanelHeader title="Orders" subtitle="Your payments and their review status." />
      <div className="p-4 sm:p-5 lg:p-8">
        <MyOrdersTable orders={orders} />
      </div>
    </>
  );
};

export default OrdersPage;
