import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminCourses } from "@/features/courses/queries";
import CourseTable from "@/features/courses/components/course-table";
import PanelHeader from "@/components/ui/panel-header";
import { buttonClass } from "@/lib/ui";

export const metadata = { title: "Courses" };

const AdminCoursesPage = async ({ searchParams }) => {
  const [{ q = "" }, courses] = await Promise.all([searchParams, getAdminCourses()]);
  return (
    <>
      <PanelHeader title="Courses" subtitle={`${courses.length} ${courses.length === 1 ? "course" : "courses"}`}>
        <Link href="/admin/courses/new" className={`${buttonClass("primary")} max-sm:hidden`}>
          <Plus className="size-4" /> New course
        </Link>
      </PanelHeader>
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:p-8">
        <Link href="/admin/courses/new" className={`${buttonClass("primary")} sm:hidden`}>
          <Plus className="size-4" /> New course
        </Link>
        <CourseTable courses={courses} initialSearch={q} />
      </div>
    </>
  );
};

export default AdminCoursesPage;
