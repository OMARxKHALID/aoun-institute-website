import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminCourses } from "@/features/courses/queries";
import CourseTable from "@/features/courses/components/course-table";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Courses" };

const AdminCoursesPage = async ({ searchParams }) => {
  const [{ q = "" }, courses] = await Promise.all([searchParams, getAdminCourses()]);
  return (
    <>
      <PanelHeader title="Courses" subtitle={`${courses.length} ${courses.length === 1 ? "course" : "courses"}`}>
        <Link href="/admin/courses/new" className="hidden items-center gap-2 rounded-full bg-linear-to-b from-[#E8602E] to-[#A8401A] px-5 py-2.5 font-medium sm:flex">
          <Plus className="size-4" /> New course
        </Link>
      </PanelHeader>
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:p-8">
        <Link href="/admin/courses/new" className="flex items-center justify-center gap-2 rounded-full bg-linear-to-b from-[#E8602E] to-[#A8401A] px-5 py-3 font-medium sm:hidden">
          <Plus className="size-4" /> New course
        </Link>
        <CourseTable courses={courses} initialSearch={q} />
      </div>
    </>
  );
};

export default AdminCoursesPage;
