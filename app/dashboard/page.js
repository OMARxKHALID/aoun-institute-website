import Link from "next/link";
import { ArrowUpRight, Award, BookOpen, CheckCircle2, ChevronRight, Clock, FileQuestion, PlayCircle, Receipt, Sparkles } from "lucide-react";
import { getStudentOverview } from "@/features/progress/queries";
import { getMyAnnouncements } from "@/features/announcements/queries";
import AnnouncementList from "@/features/announcements/components/announcement-list";
import PanelHeader from "@/components/ui/panel-header";
import EmptyState from "@/components/ui/empty-state";
import PanelCard from "@/components/ui/panel-card";
import StatCard from "@/components/ui/stat-card";
import ProgressBar from "@/components/ui/progress-bar";
import ProgressRing from "@/components/ui/progress-ring";
import BarChart from "@/components/ui/bar-chart";
import MiniCalendar from "@/components/ui/mini-calendar";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatDuration } from "@/lib/format";

const activityText = {
  lesson_completed: "Completed a lesson",
  quiz_submitted: "Submitted a quiz",
  quiz_started: "Started a quiz",
  certificate_issued: "Earned a certificate",
  enrolled: "Enrolled",
};

const SeeAll = ({ href }) => (
  <Link href={href} className="flex shrink-0 items-center gap-1 text-sm text-white/50 hover:text-accent">
    See all <ChevronRight className="size-4" />
  </Link>
);

const DashboardPage = async () => {
  const [data, announcements] = await Promise.all([getStudentOverview(), getMyAnnouncements(null, 3)]);
  const firstName = data.user.name.split(" ")[0];
  const { stats, courses } = data;
  const header = <PanelHeader title={`Welcome back, ${firstName} 👋`} subtitle={courses.length ? "Pick up where you left off." : "Here is what is happening with your learning."} />;

  if (!courses.length)
    return (
      <>
        {header}
        <div className="grid gap-5 p-4 sm:p-5 lg:p-8">
          {stats.pendingOrders > 0 && (
            <Link href="/dashboard/orders" className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/5 p-4 text-amber-200">
              <Receipt className="size-5 shrink-0" /> Your payment is under review. You will get access as soon as it is approved.
            </Link>
          )}
          <EmptyState boxed icon={BookOpen} title="No courses yet" text="Browse the catalog to start your first course. Progress, quizzes and certificates will appear here." action={{ href: "/dashboard/explore", label: "Explore courses" }} />
        </div>
      </>
    );

  const weekMinutes = data.week.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <>
      {header}
      <div className="grid gap-5 p-4 sm:p-5 lg:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 2xl:grid-cols-4">
            <StatCard icon={BookOpen} label="Courses enrolled" value={stats.enrolled} hint={`${stats.completedCourses} completed`} />
            <StatCard icon={CheckCircle2} label="Lessons completed" value={stats.completedLessons} />
            <StatCard icon={Clock} label="Hours learned" value={stats.hours} />
            <StatCard icon={Award} label="Certificates" value={stats.certificates} />
          </div>

          <PanelCard title="Continue learning" action={<SeeAll href="/dashboard/courses" />}>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {courses.slice(0, 3).map((c) => (
                <Link key={c.id} href={c.lastLesson ? `/dashboard/courses/${c.slug}/lessons/${c.lastLesson.id}` : `/dashboard/courses/${c.slug}`} className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-white/5 bg-[#070707] p-4 transition hover:border-accent/50">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent/15 text-accent">
                      {c.thumbnail?.url ? <img src={c.thumbnail.url} alt="" loading="lazy" decoding="async" className="size-full object-cover" /> : <BookOpen className="size-5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.title}</p>
                      <p className="truncate text-xs text-white/45">{c.category || "Course"}</p>
                    </div>
                  </div>
                  <ProgressBar percent={c.percent} />
                  <div className="flex items-center justify-between gap-2 text-xs text-white/50">
                    <span>
                      {c.completedLessons}/{c.totalLessons} lessons
                    </span>
                    <span className="flex items-center gap-1 text-accent">
                      Resume <PlayCircle className="size-4 transition group-hover:scale-110" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </PanelCard>

          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <PanelCard title="Watch time" action={<span className="text-sm text-white/50">{formatDuration(weekMinutes * 60)} this week</span>}>
              <BarChart label="Minutes watched per day this week" data={data.week.map((d) => ({ key: d.day, label: d.label, value: d.minutes }))} format={(v) => `${v}m`} />
            </PanelCard>
            <PanelCard title="Quizzes to take" action={<SeeAll href="/dashboard/quizzes" />}>
              {data.quizzes.length ? (
                <ul className="flex flex-col gap-2">
                  {data.quizzes.map((q) => (
                    <li key={q.id}>
                      <Link href={`/dashboard/quizzes/${q.id}`} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#070707] p-3 transition hover:border-accent/50">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                          <FileQuestion className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{q.title}</span>
                          <span className="block truncate text-xs text-white/45">{q.course}</span>
                        </span>
                        <ChevronRight className="size-4 text-white/40" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/45">No quizzes waiting. Finish lessons to unlock their quizzes.</p>
              )}
            </PanelCard>
          </div>

          <PanelCard title="Courses you're taking" action={<SeeAll href="/dashboard/courses" />}>
            <ul className="flex flex-col divide-y divide-white/5">
              {courses.map((c) => (
                <li key={c.id}>
                  <Link href={`/dashboard/courses/${c.slug}`} className="flex items-center gap-3 py-3 hover:text-accent">
                    <ProgressRing percent={c.percent} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{c.title}</span>
                      <span className="block truncate text-xs text-white/45">
                        {c.totalLessons - c.completedLessons} lessons left{c.lastActiveAt && ` · active ${formatDate(c.lastActiveAt)}`}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-white/40" />
                  </Link>
                </li>
              ))}
            </ul>
          </PanelCard>
        </div>

        <aside className="grid min-w-0 content-start gap-5 md:grid-cols-2 xl:grid-cols-1">
          <Link href="/dashboard/explore" className="group relative flex flex-col gap-2 overflow-hidden rounded-3xl bg-[#FFF3EF] p-6 text-black md:col-span-2 xl:col-span-1">
            <span className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-black text-white transition-transform group-hover:rotate-45">
              <ArrowUpRight className="size-5" />
            </span>
            <Sparkles className="size-6 text-accent" />
            <p className="font-machina text-2xl">Explore courses</p>
            <p className="pr-10 text-sm text-black/60">Add a new skill to your learning plan.</p>
          </Link>
          <div className="md:col-span-2 xl:col-span-1">
            <AnnouncementList announcements={announcements} showCourse />
          </div>
          <PanelCard>
            <MiniCalendar marked={data.activeDays} />
            <p className="text-xs text-white/40">Highlighted days are days you studied.</p>
          </PanelCard>
          <PanelCard title="Certificates" action={<SeeAll href="/dashboard/certificates" />}>
            {data.certificates.length ? (
              <ul className="flex flex-col gap-2">
                {data.certificates.map((c) => (
                  <li key={c.code} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#070707] p-3">
                    <Award className="size-5 shrink-0 text-accent" />
                    <span className="min-w-0 flex-1 truncate text-sm">{c.courseTitle}</span>
                    <StatusPill status={c.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/45">Complete a course to earn your first certificate.</p>
            )}
          </PanelCard>
          <PanelCard title="Recent activity">
            {data.activity.length ? (
              <ul className="flex flex-col gap-3 text-sm">
                {data.activity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                    <span className="min-w-0">
                      <span className="block">{activityText[a.type] ?? a.type}</span>
                      <span className="block truncate text-xs text-white/40">
                        {a.course} · {formatDate(a.createdAt)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/45">Your learning activity will show up here.</p>
            )}
          </PanelCard>
        </aside>
      </div>
    </>
  );
};

export default DashboardPage;
