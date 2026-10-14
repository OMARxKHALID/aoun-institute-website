import { BookOpen } from "lucide-react";
import { getMyCourses } from "@/features/progress/queries";
import MyCourseCard from "@/features/progress/components/my-course-card";
import PanelHeader from "@/components/ui/panel-header";
import EmptyState from "@/components/ui/empty-state";

export const metadata = { title: "My Courses" };

const MyCoursesPage = async () => {
  const courses = await getMyCourses();
  return (
    <>
      <PanelHeader title="My courses" subtitle={`${courses.length} ${courses.length === 1 ? "course" : "courses"} with lifetime access`} />
      <div className="p-4 sm:p-5 lg:p-8">
        {courses.length ? (
          <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {courses.map((c) => (
              <MyCourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <EmptyState boxed icon={BookOpen} title="No courses yet" text="You have not enrolled in any course yet. Explore the catalog to get started." action={{ href: "/dashboard/explore", label: "Explore courses" }} />
        )}
      </div>
    </>
  );
};

export default MyCoursesPage;
