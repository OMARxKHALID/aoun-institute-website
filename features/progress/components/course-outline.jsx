import Link from "next/link";
import { CheckCircle2, Circle, CircleX, FileQuestion, Lock, PlayCircle } from "lucide-react";
import { formatDuration } from "@/lib/format";

const lessonIcon = {
  completed: { icon: CheckCircle2, tone: "text-green-400", label: "Completed" },
  in_progress: { icon: PlayCircle, tone: "text-accent", label: "In progress" },
  available: { icon: Circle, tone: "text-white/50", label: "Not started" },
  locked: { icon: Lock, tone: "text-white/30", label: "Locked" },
};

const quizIcon = {
  passed: { tone: "text-green-400", label: "Passed" },
  available: { tone: "text-accent", label: "Ready" },
  retry: { tone: "text-amber-300", label: "Try again" },
  failed: { tone: "text-red-400", label: "No attempts left" },
  locked: { tone: "text-white/30", label: "Locked" },
};

const QuizItem = ({ quiz, nested }) => {
  const state = quizIcon[quiz.status];
  const Icon = quiz.status === "locked" ? Lock : quiz.status === "failed" ? CircleX : FileQuestion;
  const content = (
    <>
      <Icon className={`size-4 shrink-0 ${state.tone}`} />
      <span className="min-w-0 flex-1 truncate">{quiz.title}</span>
      <span className={`shrink-0 text-xs ${state.tone}`}>
        {state.label}
        {quiz.best != null && quiz.status !== "locked" && ` · ${quiz.best}%`}
      </span>
    </>
  );
  const className = `flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${nested ? "ml-7" : ""}`;
  if (quiz.status === "locked") return <li className={`${className} text-white/50`} title="Finish the lesson to unlock this quiz">{content}</li>;
  return (
    <li>
      <Link href={`/dashboard/quizzes/${quiz.id}`} className={`${className} bg-accent/[0.04] transition hover:bg-accent/10`}>
        {content}
      </Link>
    </li>
  );
};

const CourseOutline = ({ slug, outline, currentId, compact }) => (
  <div className="flex flex-col gap-4">
    {outline.map((section, sIndex) => (
      <details key={section.id} open={!compact || section.lessons.some((l) => l.id === currentId)} className="group rounded-2xl border border-[#302C2A] bg-[#070707]">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-3 sm:p-4 [&::-webkit-details-marker]:hidden">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 font-machina text-sm text-accent">{sIndex + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{section.title}</span>
            <span className="block text-xs text-white/50">
              {section.lessons.filter((l) => l.status === "completed").length}/{section.lessons.length} completed
            </span>
          </span>
          <span className="text-xl text-white/50 transition-transform group-open:rotate-45">+</span>
        </summary>
        <ol className="flex flex-col gap-1 px-2 pb-3">
          {section.lessons.map((lesson) => {
            const state = lessonIcon[lesson.status];
            const current = lesson.id === currentId;
            const inner = (
              <>
                <state.icon className={`size-4 shrink-0 ${state.tone}`} aria-label={state.label} />
                <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                {lesson.durationSec > 0 && <span className="shrink-0 text-xs text-white/50">{formatDuration(lesson.durationSec)}</span>}
              </>
            );
            const className = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${current ? "bg-accent/15 text-white" : "text-white/70 hover:bg-white/5"}`;
            return (
              <li key={lesson.id} className="flex flex-col gap-1">
                {lesson.status === "locked" ? (
                  <span className={`${className} cursor-not-allowed text-white/50 hover:bg-transparent`} title="Finish the previous lesson to unlock">
                    {inner}
                  </span>
                ) : (
                  <Link href={`/dashboard/courses/${slug}/lessons/${lesson.id}`} aria-current={current ? "page" : undefined} className={className}>
                    {inner}
                  </Link>
                )}
                {lesson.quiz && (
                  <ul>
                    <QuizItem quiz={lesson.quiz} nested />
                  </ul>
                )}
              </li>
            );
          })}
          {section.quizzes.map((quiz) => (
            <QuizItem key={quiz.id} quiz={quiz} />
          ))}
        </ol>
      </details>
    ))}
  </div>
);

export default CourseOutline;
