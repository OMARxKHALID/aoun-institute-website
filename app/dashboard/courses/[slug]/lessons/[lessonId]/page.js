import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FileDown, FileQuestion, Lock } from "lucide-react";
import { getStudentLesson } from "@/features/progress/queries";
import CourseOutline from "@/features/progress/components/course-outline";
import LessonPlayer, { CompleteButton, PlayerProvider } from "@/features/progress/components/lesson-player";
import LessonNotes from "@/features/notes/components/lesson-notes";
import { getLessonNotes } from "@/features/notes/queries";
import DiscussionBoard from "@/features/discussions/components/discussion-board";
import { getLessonDiscussion } from "@/features/discussions/queries";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import LessonTabs from "@/features/progress/components/lesson-tabs";
import ProgressBar from "@/components/ui/progress-bar";
import { btn, buttonClass } from "@/lib/ui";
import { fileHref } from "@/lib/upload-rules";

export const metadata = { title: "Lesson" };

const LessonPage = async ({ params, searchParams }) => {
  const [{ slug, lessonId }, { t }] = await Promise.all([params, searchParams]);
  const [data, notes, threads] = await Promise.all([getStudentLesson(slug, lessonId), getLessonNotes(lessonId), getLessonDiscussion(lessonId)]);
  const startAt = Number.isFinite(Number(t)) && t !== undefined ? Number(t) : undefined;
  if (!data) notFound();
  const { course, outline, stats, lesson, prev, next, index, total } = data;
  const base = `/dashboard/courses/${course.slug}`;
  const locked = lesson.status === "locked";
  const quizCard = lesson.quiz && (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-[#070707] p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">{lesson.quiz.status === "locked" ? <Lock className="size-5" /> : <FileQuestion className="size-5" />}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{lesson.quiz.title}</p>
        <p className="text-sm text-white/50">
          {lesson.quiz.status === "locked" ? "Unlocks when you finish this lesson." : lesson.quiz.status === "passed" ? `Passed with ${lesson.quiz.best}%` : "Test what you learned in this lesson."}
        </p>
      </div>
      {lesson.quiz.status !== "locked" && (
        <Link href={`/dashboard/quizzes/${lesson.quiz.id}`} className={btn.secondary}>
          {lesson.quiz.status === "passed" ? "View quiz" : "Take quiz"}
        </Link>
      )}
    </div>
  );

  return (
    <>
      <PanelHeader back={{ href: base, label: course.title }} title={lesson.title} subtitle={`${lesson.sectionTitle} · Lesson ${index + 1} of ${total}`} />
      <div className="grid gap-5 p-4 sm:p-5 lg:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PlayerProvider>
        <div className="flex min-w-0 flex-col gap-5">
          {locked ? (
            <div className="grid aspect-video place-items-center rounded-2xl border border-[#302C2A] bg-[#0C0C0C] p-6 text-center text-white/70">
              <div className="flex flex-col items-center gap-3">
                <Lock className="size-8 text-accent" />
                <p>Finish the previous lesson to unlock this one.</p>
                {prev && (
                  <Link href={`${base}/lessons/${prev.id}`} className={btn.primary}>
                    Go to previous lesson
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <LessonPlayer lessonId={lesson.id} title={lesson.title} startAt={startAt} />
          )}

          <div className="flex flex-wrap items-center gap-3">
            {!locked && <CompleteButton lessonId={lesson.id} completed={lesson.status === "completed"} />}
            {lesson.status === "in_progress" && <span className="text-sm text-white/50">{lesson.percent}% watched</span>}
            <div className="ml-auto flex gap-2">
              {prev && (
                <Link href={`${base}/lessons/${prev.id}`} aria-label={`Previous: ${prev.title}`} className={btn.outline}>
                  <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Previous</span>
                </Link>
              )}
              {next && (
                <Link
                  href={next.status === "locked" ? "#" : `${base}/lessons/${next.id}`}
                  aria-disabled={next.status === "locked"}
                  aria-label={`Next: ${next.title}`}
                  className={`${buttonClass("primary")} ${next.status === "locked" ? "pointer-events-none opacity-40" : ""}`}
                >
                  <span className="hidden sm:inline">Next lesson</span> <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>

          <LessonTabs
            tabs={[
              {
                value: "overview",
                label: "Overview",
                content: (
                  <div className="flex flex-col gap-4">
                    {quizCard}
                    {lesson.description ? <p className="whitespace-pre-line text-white/70">{lesson.description}</p> : !lesson.quiz && <p className="text-white/50">No description for this lesson.</p>}
                    {lesson.attachments.length > 0 && (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {lesson.attachments.map((file) => (
                          <li key={file.publicId}>
                            <a href={fileHref(file)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#070707] p-3 text-sm hover:border-accent/50">
                              <FileDown className="size-4 shrink-0 text-accent" />
                              <span className="min-w-0 flex-1 truncate">{file.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
              },
              ...(locked ? [] : [{ value: "notes", label: `Notes${notes.length ? ` (${notes.length})` : ""}`, content: <LessonNotes lessonId={lesson.id} notes={notes} timed={lesson.provider === "mux" || lesson.provider === "url"} /> }]),
              { value: "qa", label: `Q&A${threads.length ? ` (${threads.length})` : ""}`, content: <DiscussionBoard lessonId={lesson.id} threads={threads} /> },
              { value: "lessons", label: "Lessons", className: "xl:hidden", content: <CourseOutline slug={course.slug} outline={outline} currentId={lesson.id} compact /> },
            ]}
          />
        </div>
        </PlayerProvider>

        <aside className="hidden min-w-0 flex-col gap-4 xl:sticky xl:top-4 xl:flex xl:max-h-[calc(100vh-2rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]">
          <PanelCard>
            <div className="flex items-center gap-3">
              <ProgressBar percent={stats.percent} />
              <span className="text-sm font-semibold">{stats.percent}%</span>
            </div>
            <p className="text-xs text-white/50">
              {stats.completedLessons} of {stats.totalLessons} lessons completed
            </p>
          </PanelCard>
          <CourseOutline slug={course.slug} outline={outline} currentId={lesson.id} compact />
        </aside>
      </div>
    </>
  );
};

export default LessonPage;
