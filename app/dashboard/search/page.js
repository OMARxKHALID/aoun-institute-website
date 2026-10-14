import { studentSearch } from "@/features/analytics/search";
import PanelHeader from "@/components/ui/panel-header";
import SearchResults from "@/components/ui/search-results";

export const metadata = { title: "Search" };

const StudentSearchPage = async ({ searchParams }) => {
  const { q = "" } = await searchParams;
  const r = await studentSearch(q);
  return (
    <>
      <PanelHeader title="Search" subtitle={q ? `Results for “${q}”` : "Your courses, lessons and the course catalog"} query={q} />
      <div className="p-4 sm:p-5 lg:p-8">
        <SearchResults
          q={q}
          groups={r ? [
            { title: "My courses", items: r.courses },
            { title: "Lessons", items: r.lessons },
            { title: "More courses", items: r.catalog },
          ] : []}
        />
      </div>
    </>
  );
};

export default StudentSearchPage;
