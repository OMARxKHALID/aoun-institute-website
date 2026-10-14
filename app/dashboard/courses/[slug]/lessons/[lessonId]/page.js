import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FileDown, FileQuestion, Lock } from "lucide-react";
import { getStudentLesson } from "@/features/progress/queries";
import CourseOutline from "@/features/progress/components/course-outline";
import LessonPlayer, { CompleteButton } from "@/features/progress/components/lesson-player";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import ProgressBar from "@/components/ui/progress-bar";

export const metadata = { title: "Lesson" };

const LessonPage = async ({ params }) => {
  const { slug, lessonId } = await params;
  const data = await getStudentLesson(slug, lessonId);
  if (!data) notFound();
  const { course, outline, stats, lesson, prev, next, index, total } = data;
  const base = `/dashboard/courses/${course.slug}`;
  const locked = lesson.status === "locked";

  return (
    <>
      <PanelHeader back={{ href: base, label: course.title }} title={lesson.title} subtitle={`${lesson.sectionTitle} · Lesson ${index + 1} of ${total}`} />
      <div className="grid gap-5 p-4 sm:p-5 lg:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          {locked ? (
            <div className="grid aspect-video place-items-center rounded-2xl border border-[#302C2A] bg-[#0C0C0C] p-6 text-center text-white/60">
              <div className="flex flex-col items-center gap-3">
                <Lock className="size-8 text-accent" />
                <p>Finish the previous lesson to unlock this one.</p>
                {prev && (
                  <Link href={`${base}/lessons/${prev.id}`} className="rounded-full bg-accent px-5 py-2 text-white">
                    Go to previous lesson
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <LessonPlayer lessonId={lesson.id} title={lesson.title} />
          )}

          <div className="flex flex-wrap items-center gap-3">
            {!locked && <CompleteButton lessonId={lesson.id} completed={lesson.status === "completed"} />}
            {lesson.status === "in_progress" && <span className="text-sm text-white/45">{lesson.percent}% watched</span>}
            <div className="ml-auto flex gap-2">
              {prev && (
                <Link href={`${base}/lessons/${prev.id}`} aria-label={`Previous: ${prev.title}`} className="flex items-center gap-1.5 rounded-full border border-[#302C2A] px-4 py-2 text-sm hover:border-accent">
                  <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Previous</span>
                </Link>
              )}
              {next && (
                <Link
                  href={next.status === "locked" ? "#" : `${base}/lessons/${next.id}`}
                  aria-disabled={next.status === "locked"}
                  aria-label={`Next: ${next.title}`}
                  className={`flex items-center gap-1.5 rounded-full bg-linear-to-b from-[#E8602E] to-[#A8401A] px-4 py-2 text-sm font-medium ${next.status === "locked" ? "pointer-events-none opacity-40" : ""}`}
                >
                  <span className="hidden sm:inline">Next lesson</span> <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>

          {lesson.quiz && (
            <PanelCard>
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">{lesson.quiz.status === "locked" ? <Lock className="size-5" /> : <FileQuestion className="size-5" />}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{lesson.quiz.title}</p>
                  <p className="text-sm text-white/50">
                    {lesson.quiz.status === "locked"
                      ? "Unlocks when you finish this lesson."
                      : lesson.quiz.status === "passed"
                        ? `Passed with ${lesson.quiz.best}%`
                        : "Test what you learned in this lesson."}
                  </p>
                </div>
                {lesson.quiz.status !== "locked" && (
                  <Link href={`/dashboard/quizzes/${lesson.quiz.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-accent hover:text-white">
                    {lesson.quiz.status === "passed" ? "View quiz" : "Take quiz"}
                  </Link>
                )}
              </div>
            </PanelCard>
          )}

          {(lesson.description || lesson.attachments.length > 0) && (
            <PanelCard title="About this lesson">
              {lesson.description && <p className="whitespace-pre-line text-white/70">{lesson.description}</p>}
              {lesson.attachments.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {lesson.attachments.map((file) => (
                    <li key={file.publicId}>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#070707] p-3 text-sm hover:border-accent/50">
                        <FileDown className="size-4 shrink-0 text-accent" />
                        <span className="min-w-0 flex-1 truncate">{file.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <PanelCard>
            <div className="flex items-center gap-3">
              <ProgressBar percent={stats.percent} />
              <span className="text-sm font-semibold">{stats.percent}%</span>
            </div>
            <p className="text-xs text-white/45">
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
