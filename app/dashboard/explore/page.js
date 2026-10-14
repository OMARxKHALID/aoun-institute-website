import { getCatalog } from "@/features/courses/queries";
import { getMyCourses } from "@/features/progress/queries";
import CourseGrid from "@/components/sections/course-grid";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Explore Courses" };

const ExplorePage = async () => {
  const [catalog, mine] = await Promise.all([getCatalog(), getMyCourses()]);
  const enrolled = new Set(mine.map((c) => c.id));
  const courses = catalog.map((c) => ({ ...c, enrolled: enrolled.has(c.id) }));
  return (
    <>
      <PanelHeader title="Explore courses" subtitle={`${courses.length} courses · ${courses.filter((c) => !c.enrolled).length} you have not taken yet`} />
      <div className="p-4 sm:p-5 lg:p-8">
        <CourseGrid courses={courses} embedded />
      </div>
    </>
  );
};

export default ExplorePage;
