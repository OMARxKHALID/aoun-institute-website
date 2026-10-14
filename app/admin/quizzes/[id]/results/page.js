import { notFound } from "next/navigation";
import { Download, Percent, Target, Users, Repeat } from "lucide-react";
import { getQuizResults } from "@/features/quizzes/queries";
import QuizResultsTable from "@/features/quizzes/components/quiz-results-table";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import StatCard from "@/components/ui/stat-card";
import ProgressBar from "@/components/ui/progress-bar";

export const metadata = { title: "Quiz Results" };

const QuizResultsPage = async ({ params }) => {
  const { id } = await params;
  const data = await getQuizResults(id);
  if (!data) notFound();
  const { quiz, course, stats, perQuestion, rows } = data;
  const exportLink = (
    <a href={`/api/admin/quiz-results/${quiz.id}`} className="flex items-center justify-center gap-2 rounded-full border border-[#302C2A] px-4 py-2.5 text-sm hover:border-accent">
      <Download className="size-4 text-accent" /> Export CSV
    </a>
  );
  return (
    <>
      <PanelHeader back={{ href: `/admin/courses/${quiz.courseId}/quizzes/${quiz.id}`, label: quiz.title }} title="Quiz results" subtitle={`${quiz.title} · ${course.title}`}>
        <span className="hidden sm:block">{exportLink}</span>
      </PanelHeader>
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-8">
        <span className="sm:hidden">{exportLink}</span>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard icon={Repeat} label="Attempts" value={stats.attempts} />
          <StatCard icon={Users} label="Students" value={stats.students} />
          <StatCard icon={Percent} label="Average score" value={`${stats.average}%`} />
          <StatCard icon={Target} label="Students who passed" value={`${stats.passRate}%`} hint={`Pass mark ${quiz.passingPercent}%`} />
        </div>
        {perQuestion.length > 0 && (
          <PanelCard title="Correct answers by question">
            <ul className="flex flex-col gap-3">
              {perQuestion.map((q) => (
                <li key={q.id} className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-white/75">
                      {q.number}. {q.prompt}
                    </span>
                    <span className={`shrink-0 font-semibold ${q.rate < 50 ? "text-red-300" : "text-white"}`}>{q.rate}%</span>
                  </div>
                  <ProgressBar percent={q.rate} />
                </li>
              ))}
            </ul>
          </PanelCard>
        )}
        <QuizResultsTable rows={rows} />
      </div>
    </>
  );
};

export default QuizResultsPage;
