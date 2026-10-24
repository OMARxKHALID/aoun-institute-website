import Link from "next/link";
import { Award, BookOpen, CheckCircle2, ChevronRight, Clock, FileQuestion, PlayCircle, Receipt } from "lucide-react";
import { getStudentOverview } from "@/features/progress/queries";
import ContinueWatching from "@/features/progress/components/continue-watching";
import { getTodayPlans } from "@/features/calendar/queries";
import PlanList from "@/features/calendar/components/plan-list";
import { getRecommendations } from "@/features/courses/recommendations";
import RecommendedCourses from "@/features/courses/components/recommended-courses";
import { getMyAnnouncements } from "@/features/announcements/queries";
import AnnouncementList from "@/features/announcements/components/announcement-list";
import PanelHeader from "@/components/ui/panel-header";
import EmptyState from "@/components/ui/empty-state";
import PanelCard from "@/components/ui/panel-card";
import StatCard from "@/components/ui/stat-card";
import ProgressBar from "@/components/ui/progress-bar";
import BarChart from "@/components/ui/bar-chart";
import MiniCalendar from "@/components/ui/mini-calendar";
import { formatDuration } from "@/lib/format";
import { imageUrl } from "@/lib/upload-rules";

const SeeAll = ({ href }) => (
  <Link href={href} className="flex shrink-0 items-center gap-1 text-sm text-white/50 hover:text-accent">
    See all <ChevronRight className="size-4" />
  </Link>
);

const DashboardPage = async () => {
  const [data, announcements, todayPlans, recommended] = await Promise.all([getStudentOverview(), getMyAnnouncements(null, 3), getTodayPlans(), getRecommendations(3)]);
  const firstName = data.user.name.split(" ")[0];
  const { stats, courses } = data;
  const header = <PanelHeader title={`Welcome back, ${firstName} 👋`} subtitle={courses.length ? "Pick up where you left off." : "Here is what is happening with your learning."} />;

  if (!courses.length)
    return (
      <>
        {header}
        <div className="grid gap-5 p-4 sm:p-5 lg:p-8">
          {stats.pendingOrders > 0 && (
            <Link href="/dashboard/orders" className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/5 p-4 text-amber-300">
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

          <ContinueWatching courses={courses} />

          <PanelCard title="Continue learning" action={<SeeAll href="/dashboard/courses" />}>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {courses.slice(0, 3).map((c) => (
                <Link key={c.id} href={c.lastLesson ? `/dashboard/courses/${c.slug}/lessons/${c.lastLesson.id}` : `/dashboard/courses/${c.slug}`} className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-white/5 bg-[#070707] p-4 transition hover:border-accent/50">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent/15 text-accent">
                      {c.thumbnail?.url ? <img src={imageUrl(c.thumbnail.url, 160)} alt="" loading="lazy" decoding="async" className="size-full object-cover" /> : <BookOpen className="size-5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.title}</p>
                      <p className="truncate text-xs text-white/50">{c.category || "Course"}</p>
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
                  {data.quizzes.slice(0, 3).map((q) => (
                    <li key={q.id}>
                      <Link href={`/dashboard/quizzes/${q.id}`} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#070707] p-3 transition hover:border-accent/50">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                          <FileQuestion className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{q.title}</span>
                          <span className="block truncate text-xs text-white/50">{q.course}</span>
                        </span>
                        <ChevronRight className="size-4 text-white/50" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/50">No quizzes waiting. Finish lessons to unlock their quizzes.</p>
              )}
            </PanelCard>
          </div>

          {recommended.length > 0 && (
            <PanelCard title="Recommended for you" action={<SeeAll href="/dashboard/explore" />}>
              <RecommendedCourses courses={recommended} />
            </PanelCard>
          )}
        </div>

        <aside className="grid min-w-0 content-start gap-5 md:grid-cols-2 xl:grid-cols-1">
          <div className="min-w-0">
            <AnnouncementList announcements={announcements} showCourse />
          </div>
          <PanelCard title="Today's study plan" action={<SeeAll href="/dashboard/calendar" />}>
            <PlanList plans={todayPlans} empty="No sessions planned today." />
            <MiniCalendar marked={data.activeDays} />
                      </PanelCard>
        </aside>
      </div>
    </>
  );
};

export default DashboardPage;
