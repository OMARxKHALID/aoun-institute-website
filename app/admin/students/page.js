import { getAdminStudents } from "@/features/students/queries";
import StudentTable from "@/features/students/components/student-table";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Students" };

const AdminStudentsPage = async ({ searchParams }) => {
  const [{ q = "" }, students] = await Promise.all([searchParams, getAdminStudents()]);
  return (
    <>
      <PanelHeader title="Students" subtitle={`${students.length} ${students.length === 1 ? "student" : "students"}`} />
      <div className="p-4 sm:p-5 lg:p-8">
        <StudentTable students={students} initialSearch={q} />
      </div>
    </>
  );
};

export default AdminStudentsPage;
