import CourseDetailsForm from "@/features/courses/components/course-details-form";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "New Course" };

const NewCoursePage = () => (
  <>
    <PanelHeader title="New course" subtitle="Start with the basics. You can add sections and lessons next." />
    <div className="p-5 lg:p-8">
      <CourseDetailsForm />
    </div>
  </>
);

export default NewCoursePage;
