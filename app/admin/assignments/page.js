import { getAdminAssignments } from "@/features/assignments/queries";
import AssignmentManager from "@/features/assignments/components/assignment-manager";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Assignments" };

const AdminAssignmentsPage = async () => {
  const { assignments, courses } = await getAdminAssignments();
  return (
    <>
      <PanelHeader title="Assignments" subtitle="Set work for your students and grade what they hand in." />
      <div className="p-4 sm:p-5 lg:p-8">
        <AssignmentManager assignments={assignments} courses={courses} />
      </div>
    </>
  );
};

export default AdminAssignmentsPage;
