import Link from "next/link";
import { ChevronRight, ClipboardList } from "lucide-react";
import { getStudentAssignments } from "@/features/assignments/queries";
import PanelHeader from "@/components/ui/panel-header";
import StatusPill from "@/components/ui/status-pill";
import EmptyState from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Assignments" };

const pill = {
  todo: { status: "PENDING", label: "to do" },
  submitted: { status: "processing", label: "submitted" },
  graded: { status: "PAID", label: "graded" },
};

const AssignmentsPage = async () => {
  const assignments = await getStudentAssignments();
  return (
    <>
      <PanelHeader title="Assignments" subtitle="Work your teachers set in your courses." />
      <div className="p-4 sm:p-5 lg:p-8">
        {assignments.length ? (
          <ul className="flex flex-col gap-3">
            {assignments.map((a) => (
              <li key={a.id}>
                <Link href={`/dashboard/assignments/${a.id}`} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#302C2A] bg-[#0C0C0C] p-4 transition hover:border-accent">
                  <span className="min-w-0 flex-1 basis-56">
                    <span className="block font-medium">{a.title}</span>
                    <span className="block text-sm text-white/50">
                      {a.course}
                      {a.dueOn && ` · due ${formatDate(a.dueOn)}`}
                    </span>
                  </span>
                  <StatusPill status={pill[a.status].status} label={a.status === "graded" ? `graded ${a.grade}/100` : pill[a.status].label} />
                  <ChevronRight className="size-4 text-white/50" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={ClipboardList} boxed title="No assignments yet" text="When a teacher sets work in one of your courses, it shows up here." />
        )}
      </div>
    </>
  );
};

export default AssignmentsPage;
