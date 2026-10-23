import { notFound } from "next/navigation";
import { getAdminAssignment } from "@/features/assignments/queries";
import SubmissionReview from "@/features/assignments/components/submission-review";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Assignment" };

const AdminAssignmentPage = async ({ params }) => {
  const { id } = await params;
  const data = await getAdminAssignment(id);
  if (!data) notFound();
  const { assignment, submissions } = data;
  return (
    <>
      <PanelHeader back={{ href: "/admin/assignments", label: "All assignments" }} title={assignment.title} subtitle={`${assignment.course}${assignment.dueOn ? ` · due ${formatDate(assignment.dueOn)}` : ""}`} />
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-8">
        {assignment.instructions && (
          <PanelCard title="Instructions">
            <p className="whitespace-pre-line text-white/70">{assignment.instructions}</p>
          </PanelCard>
        )}
        <SubmissionReview submissions={submissions} />
      </div>
    </>
  );
};

export default AdminAssignmentPage;
