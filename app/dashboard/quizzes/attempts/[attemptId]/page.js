import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, CircleX, Trophy, XCircle } from "lucide-react";
import { getAttemptView } from "@/features/quizzes/queries";
import QuizTaker from "@/features/quizzes/components/quiz-taker";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";

export const metadata = { title: "Quiz Attempt" };

const AttemptPage = async ({ params }) => {
  const { attemptId } = await params;
  const data = await getAttemptView(attemptId);
  if (!data) notFound();
  const { attempt, quiz, course, questions, reveal } = data;
  const back = { href: `/dashboard/quizzes/${quiz.id}`, label: quiz.title };

  if (attempt.status === "in_progress")
    return (
      <>
        <PanelHeader back={back} title={quiz.title} subtitle={`Attempt ${attempt.attemptNo} · ${course.title}`} />
        <div className="p-4 sm:p-5 lg:p-8">
          <QuizTaker attempt={attempt} quiz={quiz} questions={questions} />
        </div>
      </>
    );

  return (
    <>
      <PanelHeader back={back} title="Your result" subtitle={`${quiz.title} · Attempt ${attempt.attemptNo}`} />
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-8">
        <div className={`flex flex-col items-start gap-3 rounded-3xl p-6 sm:flex-row sm:items-center ${attempt.passed ? "bg-green-500/10" : "bg-red-500/10"}`}>
          {attempt.passed ? <Trophy className="size-12 shrink-0 text-green-300" /> : <XCircle className="size-12 shrink-0 text-red-300" />}
          <div className="min-w-0 flex-1">
            <p className="font-machina text-4xl">{attempt.percent}%</p>
            <p className="text-white/70">
              {attempt.score} of {attempt.maxScore} points · pass mark {quiz.passingPercent}% · {attempt.passed ? "Passed" : "Not passed"}
              {attempt.status === "expired" && " · submitted when time ran out"}
            </p>
          </div>
          <Link href={`/dashboard/courses/${course.slug}`} className="rounded-full bg-white px-5 py-2.5 font-medium text-black hover:bg-accent hover:text-white">
            Back to course
          </Link>
        </div>

        {!reveal && <p className="text-sm text-white/50">Correct answers are hidden for this quiz{quiz.passingPercent ? " until you pass" : ""}.</p>}

        {questions.map((q, i) => (
          <PanelCard key={q.id}>
            <div className="flex items-start gap-3">
              {q.correct ? <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-green-400" /> : <CircleX className="mt-0.5 size-6 shrink-0 text-red-400" />}
              <p className="min-w-0 whitespace-pre-line break-words">
                <span className="text-white/45">{i + 1}. </span>
                {q.prompt}
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {q.options.map((o) => {
                const picked = q.selected.includes(o.id);
                const tone = reveal && o.isCorrect ? "border-green-500/50 bg-green-500/10" : picked ? (reveal ? "border-red-500/40 bg-red-500/5" : "border-accent/60 bg-accent/10") : "border-[#302C2A]";
                return (
                  <li key={o.id} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${tone}`}>
                    {picked ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" /> : <Circle className="mt-0.5 size-4 shrink-0 text-white/30" />}
                    <span className="min-w-0 flex-1 break-words">{o.text}</span>
                    {picked && <span className="shrink-0 text-xs text-white/50">Your answer</span>}
                  </li>
                );
              })}
            </ul>
            {reveal && q.explanation && <p className="rounded-xl bg-white/[0.03] p-3 text-sm text-white/65">{q.explanation}</p>}
          </PanelCard>
        ))}
      </div>
    </>
  );
};

export default AttemptPage;
