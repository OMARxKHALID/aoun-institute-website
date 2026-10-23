import Link from "next/link";
import { Award, CheckCircle2, Clock, Flame, Percent } from "lucide-react";
import { getLearningReport } from "@/features/progress/queries";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import StatCard from "@/components/ui/stat-card";
import BarChart from "@/components/ui/bar-chart";
import ProgressBar from "@/components/ui/progress-bar";
import StatusPill from "@/components/ui/status-pill";
import EmptyState from "@/components/ui/empty-state";
import BadgeGrid from "@/features/progress/components/badge-grid";
import { formatDate, formatDuration } from "@/lib/format";

export const metadata = { title: "Progress" };

const ProgressPage = async () => {
  const r = await getLearningReport();
  return (
    <>
      <PanelHeader title="Learning progress" subtitle="Your study time, course progress and quiz results." />
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 2xl:grid-cols-4">
          <StatCard icon={Flame} label="Day streak" value={r.streak} hint={`Best ${r.bestStreak} days`} />
          <StatCard icon={Clock} label="Time studied" value={formatDuration(r.totals.minutes * 60)} hint={`${r.activeDays} active days in 12 weeks`} />
          <StatCard icon={CheckCircle2} label="Lessons completed" value={r.totals.lessons} />
          <StatCard icon={Percent} label="Average quiz score" value={r.totals.averageScore == null ? "—" : `${r.totals.averageScore}%`} hint={`${r.totals.quizzesPassed} quizzes passed`} />
        </div>

        <PanelCard title="Badges" action={<span className="text-sm text-white/50">{r.badges.filter((b) => b.earned).length} of {r.badges.length} earned</span>}>
          <BadgeGrid badges={r.badges} />
        </PanelCard>

        <PanelCard title="Weekly study time" action={<span className="text-sm text-white/50">Last 12 weeks, minutes</span>}>
          <BarChart label="Minutes studied per week for the last twelve weeks" data={r.weeks} format={(v) => `${v}m`} />
        </PanelCard>

        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <PanelCard title="Course progress">
            {r.courses.length ? (
              <ul className="flex flex-col gap-4">
                {r.courses.map((c) => (
                  <li key={c.id}>
                    <Link href={`/dashboard/courses/${c.slug}`} className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-[#070707] p-4 transition hover:border-accent/50">
                      <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 truncate font-medium">{c.title}</span>
                        {c.eligible ? (
                          <span className="flex shrink-0 items-center gap-1 text-xs text-green-400">
                            <Award className="size-4" /> Certified
                          </span>
                        ) : (
                          <span className="shrink-0 text-sm font-semibold">{c.percent}%</span>
                        )}
                      </div>
                      <ProgressBar percent={c.percent} />
                      <p className="text-xs text-white/50">
                        {c.completedLessons}/{c.totalLessons} lessons · {formatDuration(c.timeSpentSec)} watched
                        {c.lastActiveAt && ` · last active ${formatDate(c.lastActiveAt)}`}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={CheckCircle2} text="Enroll in a course to start tracking progress." action={{ href: "/dashboard/explore", label: "Explore courses" }} />
            )}
          </PanelCard>

          <PanelCard title="Recent quiz results">
            {r.attempts.length ? (
              <ul className="flex flex-col divide-y divide-white/5">
                {r.attempts.map((a) => (
                  <li key={a.id}>
                    <Link href={`/dashboard/quizzes/attempts/${a.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 hover:text-accent">
                      <span className="min-w-0 flex-1 basis-48">
                        <span className="block truncate">{a.quiz}</span>
                        <span className="block truncate text-xs text-white/50">
                          {a.course} · attempt {a.attemptNo} · {formatDate(a.submittedAt)}
                        </span>
                      </span>
                      <span className="font-semibold">{a.percent}%</span>
                      <StatusPill status={a.passed ? "PAID" : "FAILED"} label={a.passed ? "passed" : "not passed"} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Percent} text="Your quiz results will show up here." action={{ href: "/dashboard/quizzes", label: "See quizzes" }} />
            )}
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default ProgressPage;
