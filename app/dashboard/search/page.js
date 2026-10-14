import { studentSearch } from "@/features/analytics/search";
import PanelHeader from "@/components/ui/panel-header";
import SearchResults from "@/components/ui/search-results";

export const metadata = { title: "Search" };

const StudentSearchPage = async ({ searchParams }) => {
  const { q = "" } = await searchParams;
  const r = await studentSearch(q);
  return (
    <>
      <PanelHeader title="Search" subtitle={q ? `Results for “${q}”` : "Courses, lessons, quizzes, notes, certificates and pages"} query={q} />
      <div className="p-4 sm:p-5 lg:p-8">
        <SearchResults
          q={q}
          groups={r ? [
            { title: "Pages", items: r.pages },
            { title: "My courses", items: r.courses },
            { title: "Lessons", items: r.lessons },
            { title: "Quizzes", items: r.quizzes },
            { title: "My notes", items: r.notes },
            { title: "Certificates", items: r.certificates },
            { title: "More courses", items: r.catalog },
          ] : []}
        />
      </div>
    </>
  );
};

export default StudentSearchPage;
