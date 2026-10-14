import { getAdminReviews } from "@/features/reviews/queries";
import ReviewTable from "@/features/reviews/components/review-table";
import PanelHeader from "@/components/ui/panel-header";
import { plural } from "@/lib/format";

export const metadata = { title: "Reviews" };

const AdminReviewsPage = async () => {
  const reviews = await getAdminReviews();
  const average = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  return (
    <>
      <PanelHeader title="Reviews" subtitle={average ? `${plural(reviews.length, "review")} · average ${average} stars` : "No reviews yet"} />
      <div className="p-4 sm:p-5 lg:p-8">
        <ReviewTable reviews={reviews} />
      </div>
    </>
  );
};

export default AdminReviewsPage;
