import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, FileQuestion, Lock, Repeat, Target } from "lucide-react";
import { getStudentQuiz } from "@/features/quizzes/queries";
import StartQuizButton from "@/features/quizzes/components/start-quiz-button";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import StatCard from "@/components/ui/stat-card";
import StatusPill from "@/components/ui/status-pill";
import { formatDate } from "@/lib/format";
import { btn } from "@/lib/ui";

export const metadata = { title: "Quiz" };

const QuizPage = async ({ params }) => {
  const { quizId } = await params;
  const data = await getStudentQuiz(quizId);
  if (!data) notFound();
  const { quiz, course, lesson, state, attempts } = data;
  const open = attempts.find((a) => a.status === "in_progress");
  const used = attempts.length;
  const canStart = state.status !== "locked" && state.status !== "failed";

  return (
    <>
      <PanelHeader back={{ href: `/dashboard/courses/${course.slug}`, label: course.title }} title={quiz.title} subtitle={lesson ? `Quiz after “${lesson.title}”` : course.title} />
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard icon={FileQuestion} label="Questions" value={quiz.questionCount} />
          <StatCard icon={Target} label="Pass mark" value={`${quiz.passingPercent}%`} />
          <StatCard icon={Clock} label="Time limit" value={quiz.timeLimitSec ? `${Math.round(quiz.timeLimitSec / 60)} min` : "None"} />
          <StatCard icon={Repeat} label="Attempts used" value={quiz.maxAttempts ? `${used} / ${quiz.maxAttempts}` : used} />
        </div>

        <PanelCard>
          {quiz.description && <p className="whitespace-pre-line text-white/70">{quiz.description}</p>}
          {state.status === "locked" ? (
            <p className="flex items-center gap-2 text-white/60">
              <Lock className="size-5 text-accent" /> {lesson ? "Finish the lesson video to unlock this quiz." : "Finish the section lessons to unlock this quiz."}
              {lesson && (
                <Link href={`/dashboard/courses/${course.slug}/lessons/${lesson.id}`} className="text-accent hover:underline">
                  Go to lesson
                </Link>
              )}
            </p>
          ) : state.status === "passed" ? (
            <p className="text-green-300">You passed this quiz with {state.best}%.</p>
          ) : state.status === "failed" ? (
            <p className="text-red-300">You have used all your attempts. Contact the institute if you need another try.</p>
          ) : null}
          {quiz.timeLimitSec > 0 && canStart && !open && <p className="text-sm text-white/50">The timer starts when you press start and keeps running if you leave the page.</p>}
          {open ? (
            <Link href={`/dashboard/quizzes/attempts/${open.id}`} className={`self-start ${btn.primary}`}>
              Resume attempt
            </Link>
          ) : (
            canStart && <StartQuizButton quizId={quiz.id} label={state.status === "passed" ? "Retake quiz" : used ? "Try again" : "Start quiz"} />
          )}
        </PanelCard>

        {attempts.length > 0 && (
          <PanelCard title="Your attempts">
            <ul className="flex flex-col divide-y divide-white/5">
              {attempts.map((a) => (
                <li key={a.id}>
                  <Link href={`/dashboard/quizzes/attempts/${a.id}`} className="flex flex-wrap items-center gap-3 py-3 hover:text-accent">
                    <span className="font-medium">Attempt {a.attemptNo}</span>
                    <span className="text-sm text-white/45">{formatDate(a.submittedAt ?? a.startedAt)}</span>
                    <span className="ml-auto flex items-center gap-3">
                      {a.percent != null && <span className="font-semibold">{a.percent}%</span>}
                      <StatusPill status={a.status} label={a.status === "in_progress" ? "in progress" : a.passed ? "passed" : "not passed"} tone={a.status === "in_progress" ? "accent" : a.passed ? "green" : "red"} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </PanelCard>
        )}
      </div>
    </>
  );
};

export default QuizPage;
