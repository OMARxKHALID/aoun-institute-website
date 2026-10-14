import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FileQuestion, Pencil } from "lucide-react";
import { getLessonForEdit } from "@/features/courses/queries";
import LessonForm from "@/features/courses/components/lesson-form";
import LessonVideoField from "@/features/video/components/lesson-video-field";
import AddQuizButton from "@/features/quizzes/components/add-quiz-button";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import StatusPill from "@/components/ui/status-pill";

export const metadata = { title: "Edit Lesson" };

const EditLessonPage = async ({ params }) => {
  const { id, lessonId } = await params;
  const data = await getLessonForEdit(id, lessonId);
  if (!data) notFound();
  const { course, lesson, section, position, prev, next, quiz } = data;
  const base = `/admin/courses/${course.id}`;

  return (
    <>
      <PanelHeader back={{ href: base, label: course.title }} title={lesson.title} subtitle={`Section ${section.number}: ${section.title} · Lesson ${position.index} of ${position.total}`} />
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
        <div className="flex min-w-0 flex-col gap-5">
          <PanelCard id="video">
            <LessonVideoField lessonId={lesson.id} video={lesson.video} upload={lesson.upload} />
          </PanelCard>
          <PanelCard title="Lesson details">
            <LessonForm lesson={lesson} />
          </PanelCard>
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          <PanelCard title="Status">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
              <StatusPill status={lesson.status} />
              {lesson.isFreePreview && <StatusPill status="preview" tone="accent" label="free preview" />}
              <StatusPill status={lesson.upload?.status ?? lesson.video?.status ?? "none"} label={`video ${lesson.upload?.status ?? lesson.video?.status ?? "missing"}`} />
            </div>
            <p className="text-sm text-white/50">Students only see published lessons. Free preview lessons can be watched before buying.</p>
            {course.status === "published" && lesson.status === "published" && (
              <a href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-accent hover:underline">
                View course page <ExternalLink className="size-3.5" />
              </a>
            )}
          </PanelCard>

          <PanelCard title="Quiz after this lesson">
            {quiz ? (
              <Link href={`${base}/quizzes/${quiz.id}`} className="flex items-center gap-3 rounded-xl border border-[#302C2A] p-3 transition hover:border-accent">
                <FileQuestion className="size-5 shrink-0 text-accent" />
                <span className="min-w-0 flex-1 truncate">{quiz.title}</span>
                <StatusPill status={quiz.status} />
                <Pencil className="size-4 text-white/40" />
              </Link>
            ) : (
              <>
                <p className="text-sm text-white/50">Students unlock this quiz after they finish the lesson video.</p>
                <AddQuizButton courseId={course.id} sectionId={String(lesson.sectionId)} lessonId={lesson.id} defaultTitle={`${lesson.title} quiz`} />
              </>
            )}
          </PanelCard>

          <nav aria-label="Lesson navigation" className="grid grid-cols-2 gap-3">
            {prev ? (
              <Link href={`${base}/lessons/${prev.id}`} className="flex min-w-0 flex-col gap-1 rounded-2xl border border-[#302C2A] p-3 text-sm transition hover:border-accent">
                <span className="flex items-center gap-1 text-white/45">
                  <ArrowLeft className="size-3.5" /> Previous
                </span>
                <span className="truncate">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`${base}/lessons/${next.id}`} className="flex min-w-0 flex-col items-end gap-1 rounded-2xl border border-[#302C2A] p-3 text-right text-sm transition hover:border-accent">
                <span className="flex items-center gap-1 text-white/45">
                  Next <ArrowRight className="size-3.5" />
                </span>
                <span className="w-full truncate">{next.title}</span>
              </Link>
            )}
          </nav>
        </aside>
      </div>
    </>
  );
};

export default EditLessonPage;
