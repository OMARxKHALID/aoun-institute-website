import { notFound } from "next/navigation";
import { getStudentAssignment } from "@/features/assignments/queries";
import SubmissionForm from "@/features/assignments/components/submission-form";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Assignment" };

const AssignmentPage = async ({ params }) => {
  const { id } = await params;
  const data = await getStudentAssignment(id);
  if (!data) notFound();
  const { assignment, submission } = data;
  return (
    <>
      <PanelHeader back={{ href: "/dashboard/assignments", label: "All assignments" }} title={assignment.title} subtitle={`${assignment.course}${assignment.dueOn ? ` · due ${formatDate(assignment.dueOn)}` : ""}`} />
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-8">
        {assignment.instructions && (
          <PanelCard title="Instructions">
            <p className="whitespace-pre-line text-white/70">{assignment.instructions}</p>
          </PanelCard>
        )}
        <PanelCard title={submission?.status === "graded" ? "Your grade" : "Your submission"}>
          <SubmissionForm assignmentId={assignment.id} submission={submission} />
        </PanelCard>
      </div>
    </>
  );
};

export default AssignmentPage;
