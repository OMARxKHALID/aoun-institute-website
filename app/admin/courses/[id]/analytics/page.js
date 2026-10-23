import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircleQuestion, Users } from "lucide-react";
import { getLessonAnalytics } from "@/features/analytics/lesson-stats";
import LessonStatsTable from "@/features/analytics/components/lesson-stats-table";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import StatCard from "@/components/ui/stat-card";
import BarChart from "@/components/ui/bar-chart";

export const metadata = { title: "Lesson analytics" };

const LessonAnalyticsPage = async ({ params }) => {
  const { id } = await params;
  const data = await getLessonAnalytics(id);
  if (!data) notFound();
  const { course, enrolled, lessons } = data;
  const finishedAll = lessons.at(-1)?.completed ?? 0;
  const questions = lessons.reduce((sum, l) => sum + l.questions, 0);
  return (
    <>
      <PanelHeader back={{ href: `/admin/courses/${course.id}`, label: course.title }} title="Lesson analytics" subtitle="Where students keep going, slow down or stop." />
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          <StatCard icon={Users} label="Enrolled" value={enrolled} />
          <StatCard icon={CheckCircle2} label="Finished the last lesson" value={finishedAll} hint={enrolled ? `${Math.round((finishedAll / enrolled) * 100)}% of enrolled` : undefined} />
          <StatCard icon={MessageCircleQuestion} label="Questions asked" value={questions} />
        </div>
        {lessons.length > 0 && (
          <PanelCard title="Completions by lesson">
            <BarChart data={lessons.map((l) => ({ key: l.id, label: String(l.number), value: l.completed }))} label="Students who completed each lesson, in course order" />
          </PanelCard>
        )}
        <LessonStatsTable lessons={lessons} />
      </div>
    </>
  );
};

export default LessonAnalyticsPage;
