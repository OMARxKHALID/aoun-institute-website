import { getCatalog } from "@/features/courses/queries";
import { getMyCourses } from "@/features/progress/queries";
import CourseGrid from "@/components/sections/course-grid";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import { rankRecommendations } from "@/features/courses/recommendations";
import RecommendedCourses from "@/features/courses/components/recommended-courses";
import { plural } from "@/lib/format";

export const metadata = { title: "Explore Courses" };

const ExplorePage = async () => {
  const [catalog, mine] = await Promise.all([getCatalog(), getMyCourses()]);
  const enrolled = new Set(mine.map((c) => c.id));
  const courses = catalog.map((c) => ({ ...c, enrolled: enrolled.has(c.id) }));
  const recommended = rankRecommendations(catalog, mine.map((c) => ({ id: c.id, category: c.category, level: catalog.find((x) => x.id === c.id)?.level, percent: c.percent }))).slice(0, 3);
  return (
    <>
      <PanelHeader title="Explore courses" subtitle={`${plural(courses.length, "course")} · ${courses.filter((c) => !c.enrolled).length} you have not taken yet`} />
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-8">
        {recommended.length > 0 && (
          <PanelCard title="Recommended for you">
            <RecommendedCourses courses={recommended} />
          </PanelCard>
        )}
        <CourseGrid courses={courses} embedded />
      </div>
    </>
  );
};

export default ExplorePage;
