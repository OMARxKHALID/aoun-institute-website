import { notFound } from "next/navigation";
import { getCourseForEdit } from "@/features/courses/queries";
import CourseEditor from "@/features/courses/components/course-editor";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Edit Course" };

const EditCoursePage = async ({ params }) => {
  const { id } = await params;
  const data = await getCourseForEdit(id);
  if (!data) notFound();
  return (
    <>
      <PanelHeader title={data.course.title} subtitle={data.course.subtitle} />
      <div className="p-5 lg:p-8">
        <CourseEditor course={data.course} outline={data.outline} students={data.students} />
      </div>
    </>
  );
};

export default EditCoursePage;
