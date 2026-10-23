import CourseDetailsForm from "@/features/courses/components/course-details-form";
import PanelHeader from "@/components/ui/panel-header";
import { getUser, isAdmin } from "@/lib/dal";

export const metadata = { title: "New Course" };

const NewCoursePage = async () => {
  const owner = isAdmin(await getUser());
  return (
    <>
      <PanelHeader back={{ href: "/admin/courses", label: "All courses" }} title="New course" subtitle="Start with the basics. You can add sections and lessons next." />
      <div className="p-4 sm:p-5 lg:p-8">
        <CourseDetailsForm owner={owner} />
      </div>
    </>
  );
};

export default NewCoursePage;
