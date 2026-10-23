import { getAdminCoupons } from "@/features/coupons/queries";
import CouponManager from "@/features/coupons/components/coupon-manager";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Coupons" };

const AdminCouponsPage = async () => {
  const { coupons, courses } = await getAdminCoupons();
  return (
    <>
      <PanelHeader title="Coupons" subtitle="Discount codes students enter at checkout." />
      <div className="p-4 sm:p-5 lg:p-8">
        <CouponManager coupons={coupons} courses={courses} />
      </div>
    </>
  );
};

export default AdminCouponsPage;
