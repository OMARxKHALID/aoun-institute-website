import { adminSearch } from "@/features/analytics/search";
import PanelHeader from "@/components/ui/panel-header";
import SearchResults from "@/components/ui/search-results";

export const metadata = { title: "Search" };

const AdminSearchPage = async ({ searchParams }) => {
  const { q = "" } = await searchParams;
  const r = await adminSearch(q);
  return (
    <>
      <PanelHeader title="Search" subtitle={q ? `Results for “${q}”` : "Courses, lessons, students, orders and certificates"} query={q} />
      <div className="p-4 sm:p-5 lg:p-8">
        <SearchResults
          q={q}
          groups={r ? [
            { title: "Courses", items: r.courses },
            { title: "Lessons", items: r.lessons },
            { title: "Students", items: r.students },
            { title: "Orders", items: r.orders },
            { title: "Certificates", items: r.certificates },
          ] : []}
        />
      </div>
    </>
  );
};

export default AdminSearchPage;
