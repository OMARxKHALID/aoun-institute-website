import { adminSearch } from "@/features/analytics/search";
import PanelHeader from "@/components/ui/panel-header";
import SearchResults from "@/components/ui/search-results";

export const metadata = { title: "Search" };

const AdminSearchPage = async ({ searchParams }) => {
  const { q = "" } = await searchParams;
  const r = await adminSearch(q);
  return (
    <>
      <PanelHeader title="Search" subtitle={q ? `Results for “${q}”` : "Courses, lessons, quizzes, students, orders, certificates and pages"} query={q} />
      <div className="p-4 sm:p-5 lg:p-8">
        <SearchResults
          q={q}
          groups={r ? [
            { title: "Pages", items: r.pages },
            { title: "Courses", items: r.courses },
            { title: "Lessons", items: r.lessons },
            { title: "Quizzes", items: r.quizzes },
            { title: "Students", items: r.students },
            { title: "Orders", items: r.orders },
            { title: "Certificates", items: r.certificates },
            { title: "Announcements", items: r.announcements },
          ] : []}
        />
      </div>
    </>
  );
};

export default AdminSearchPage;
