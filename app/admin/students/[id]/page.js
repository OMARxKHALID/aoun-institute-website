import { notFound } from "next/navigation";
import { Award, BookOpen, FileQuestion, Receipt } from "lucide-react";
import { getAdminStudent } from "@/features/students/queries";
import { AccountControls, EnrollControl, RevokeEnrollmentButton } from "@/features/students/components/student-controls";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import StatCard from "@/components/ui/stat-card";
import StatusPill from "@/components/ui/status-pill";
import ProgressBar from "@/components/ui/progress-bar";
import { formatDate, formatDuration, formatPrice } from "@/lib/format";

export const metadata = { title: "Student" };

const Info = ({ label, value }) =>
  value ? (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="break-words">{value}</dd>
    </div>
  ) : null;

const StudentPage = async ({ params }) => {
  const { id } = await params;
  const data = await getAdminStudent(id);
  if (!data) notFound();
  const { student, enrollments, orders, certificates, attempts, courses } = data;
  const active = enrollments.filter((e) => e.status === "active");
  const enrolledIds = new Set(active.map((e) => e.courseId));

  return (
    <>
      <PanelHeader back={{ href: "/admin/students", label: "All students" }} title={student.name} subtitle={student.email} />
      <div className="grid gap-5 p-4 sm:p-5 lg:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 2xl:grid-cols-4">
            <StatCard icon={BookOpen} label="Courses" value={active.length} />
            <StatCard icon={Receipt} label="Paid" value={formatPrice(orders.filter((o) => o.status === "PAID").reduce((s, o) => s + o.amount, 0))} />
            <StatCard icon={FileQuestion} label="Quiz attempts" value={attempts} />
            <StatCard icon={Award} label="Certificates" value={certificates.filter((c) => c.status === "VALID").length} />
          </div>

          <PanelCard title="Courses">
            {enrollments.length ? (
              <ul className="flex flex-col divide-y divide-white/5">
                {enrollments.map((e) => (
                  <li key={e.courseId} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1 basis-56">
                      <p className="truncate font-medium">{e.course}</p>
                      <p className="text-xs text-white/45">
                        Enrolled {formatDate(e.enrolledAt)} · {e.source === "manual" ? "added by admin" : "paid"} · {formatDuration(e.timeSpentSec)} watched
                        {e.lastActiveAt && ` · active ${formatDate(e.lastActiveAt)}`}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <ProgressBar percent={e.percent} />
                        <span className="text-sm">{e.percent}%</span>
                      </div>
                    </div>
                    {e.status === "active" ? <RevokeEnrollmentButton studentId={student.id} courseId={e.courseId} course={e.course} /> : <StatusPill status="revoked" label="access removed" />}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/45">Not enrolled in any course.</p>
            )}
            <EnrollControl studentId={student.id} courses={courses.filter((c) => !enrolledIds.has(c.value))} />
          </PanelCard>

          <PanelCard title="Orders">
            {orders.length ? (
              <ul className="flex flex-col divide-y divide-white/5 text-sm">
                {orders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="min-w-0 flex-1 truncate">{o.course}</span>
                    <span>{formatPrice(o.amount, o.currency)}</span>
                    <span className="text-white/45">{formatDate(o.createdAt)}</span>
                    <StatusPill status={o.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/45">No orders.</p>
            )}
          </PanelCard>
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          <PanelCard title="Account">
            <div className="flex flex-wrap gap-2">
              <StatusPill status={student.banned ? "banned" : "active"} />
              {!student.emailVerified && <StatusPill status="unverified" label="email not verified" />}
              {student.deletionRequestedAt && <StatusPill status="deletion" label="asked for deletion" />}
            </div>
            {student.banned && student.banReason && <p className="text-sm text-red-300/80">Blocked: {student.banReason}</p>}
            <dl className="flex flex-col gap-3 text-sm">
              <Info label="Joined" value={formatDate(student.joinedAt)} />
              <Info label="Phone" value={student.phone} />
              <Info label="Location" value={[student.city, student.country].filter(Boolean).join(", ")} />
              <Info label="Bio" value={student.bio} />
            </dl>
            <AccountControls student={student} />
          </PanelCard>
          <PanelCard title="Certificates">
            {certificates.length ? (
              <ul className="flex flex-col gap-2 text-sm">
                {certificates.map((c) => (
                  <li key={c.code} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate">{c.courseTitle}</span>
                    <StatusPill status={c.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/45">None yet.</p>
            )}
          </PanelCard>
        </aside>
      </div>
    </>
  );
};

export default StudentPage;
