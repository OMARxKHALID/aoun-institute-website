import Link from "next/link";
import { getMyCourses } from "@/features/progress/queries";
import MyCourseCard from "@/features/progress/components/my-course-card";
import PanelHeader from "@/components/ui/panel-header";

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
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-6 sm:p-8">
            <p className="text-white/60">You have not enrolled in any course yet.</p>
            <Link href="/courses" className="rounded-full bg-white px-5 py-2.5 font-medium text-black hover:bg-accent hover:text-white">
              Browse courses
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default MyCoursesPage;
