"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  CircleDashed,
  Clapperboard,
  Clock,
  Eye,
  EyeOff,
  FileQuestion,
  FolderInput,
  GripVertical,
  Layers,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Send,
  Trash2,
  TriangleAlert,
  Undo2,
  Video,
} from "lucide-react";
import { addLesson, addSection, deleteLesson, deleteSection, publishAllLessons, renameSection, reorderOutline, setLessonFlags } from "@/features/courses/actions";
import { createQuiz } from "@/features/quizzes/actions";
import ActionMenu from "@/components/ui/action-menu";
import StatusPill from "@/components/ui/status-pill";
import FormAlert from "@/components/ui/form-alert";
import { formatDuration, plural } from "@/lib/format";
import { useDialog } from "@/components/ui/dialog-provider";
import { buttonClass, inputClass } from "@/lib/ui";

const toOrder = (sections) => sections.map((s) => ({ id: s.id, lessonIds: s.lessons.map((l) => l.id) }));

const moveItem = (list, from, to) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const videoState = (lesson) => {
  const status = lesson.upload?.status ?? lesson.video?.status ?? "none";
  if (status === "ready") return { icon: Video, tone: "text-green-400", label: "Video ready" };
  if (status === "uploading" || status === "processing") return { icon: Loader2, tone: "animate-spin text-amber-300", label: "Video processing" };
  if (status === "failed") return { icon: TriangleAlert, tone: "text-red-400", label: "Video failed" };
  return { icon: Clapperboard, tone: "text-white/30", label: "No video yet" };
};

const InlineAdd = ({ placeholder, onAdd, button = "Add" }) => {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim().length < 2) return;
    startTransition(async () => {
      const ok = await onAdd(value.trim());
      if (ok) setValue("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`min-w-0 flex-1 ${inputClass}`}
      />
      <button disabled={pending} className={`${buttonClass("outline")} shrink-0`}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} {button}
      </button>
    </form>
  );
};

const Stat = ({ icon: Icon, label, value, tone = "text-accent" }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-[#302C2A] bg-[#0C0C0C] px-4 py-3">
    <Icon className={`size-5 shrink-0 ${tone}`} />
    <div className="min-w-0">
      <p className="text-lg font-semibold leading-tight">{value}</p>
      <p className="truncate text-xs text-white/45">{label}</p>
    </div>
  </div>
);

const QuizRow = ({ courseId, quiz, label, nested }) => (
  <Link
    href={`/admin/courses/${courseId}/quizzes/${quiz.id}`}
    className={`flex items-center gap-2.5 rounded-2xl border border-dashed border-accent/25 bg-accent/[0.03] px-3 py-2.5 text-sm transition hover:border-accent/60 ${nested ? "ml-6 sm:ml-10" : ""}`}
  >
    <FileQuestion className="size-4 shrink-0 text-accent" />
    <span className="min-w-0 flex-1 truncate">
      <span className="text-white/45">{label}: </span>
      {quiz.title}
    </span>
    <StatusPill status={quiz.status} />
    <Pencil className="size-3.5 shrink-0 text-white/40" />
  </Link>
);

const SyllabusBuilder = ({ courseId, outline }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [sections, setSections] = useState(outline);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [error, setError] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setSections(outline), [outline]);

  const run = async (action) => {
    setError(null);
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (!result.ok) {
      setError(Object.values(result.errors).flat()[0]);
      return null;
    }
    router.refresh();
    return result;
  };

  const commitOrder = async (next) => {
    const previous = sections;
    setSections(next);
    const ok = await run(() => reorderOutline(courseId, toOrder(next)));
    if (!ok) setSections(previous);
  };

  const cloneSections = () => sections.map((s) => ({ ...s, lessons: [...s.lessons] }));

  const moveSection = (index, delta) => commitOrder(moveItem(sections, index, index + delta));

  const moveLesson = (sIndex, lIndex, delta) => {
    const next = cloneSections();
    const target = lIndex + delta;
    const [lesson] = next[sIndex].lessons.splice(lIndex, 1);
    if (target < 0) next[sIndex - 1].lessons.push(lesson);
    else if (target > next[sIndex].lessons.length) next[sIndex + 1].lessons.unshift(lesson);
    else next[sIndex].lessons.splice(target, 0, lesson);
    commitOrder(next);
  };

  const moveLessonTo = (sIndex, lIndex, toSection) => {
    const next = cloneSections();
    const [lesson] = next[sIndex].lessons.splice(lIndex, 1);
    next[toSection].lessons.push(lesson);
    commitOrder(next);
  };

  const handleDragStart = (payload) => (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", payload.id);
    setDragging(payload);
  };

  const handleDragEnd = () => setDragging(null);

  const handleDropOnLesson = (sIndex, lIndex) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragging?.type !== "lesson") return;
    const next = cloneSections();
    const fromS = next.findIndex((s) => s.lessons.some((l) => l.id === dragging.id));
    const fromL = next[fromS].lessons.findIndex((l) => l.id === dragging.id);
    const [lesson] = next[fromS].lessons.splice(fromL, 1);
    const insertAt = fromS === sIndex && fromL < lIndex ? lIndex - 1 : lIndex;
    next[sIndex].lessons.splice(insertAt, 0, lesson);
    setDragging(null);
    commitOrder(next);
  };

  const handleDropOnSection = (sIndex) => (e) => {
    e.preventDefault();
    if (!dragging) return;
    if (dragging.type === "section") {
      const from = sections.findIndex((s) => s.id === dragging.id);
      setDragging(null);
      if (from !== sIndex) commitOrder(moveItem(sections, from, sIndex));
      return;
    }
    const next = sections.map((s) => ({ ...s, lessons: s.lessons.filter((l) => l.id !== dragging.id) }));
    const lesson = sections.flatMap((s) => s.lessons).find((l) => l.id === dragging.id);
    next[sIndex].lessons.push(lesson);
    setDragging(null);
    commitOrder(next);
  };

  const allowDrop = (e) => e.preventDefault();

  const toggleSection = (id) => () =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleCollapseAll = () => setCollapsed(new Set(sections.map((s) => s.id)));
  const handleExpandAll = () => setCollapsed(new Set());

  const handleAddSection = (title) => run(() => addSection(courseId, { title }));
  const handleAddLesson = (sectionId) => (title) => run(() => addLesson(sectionId, { title }));
  const handleRename = (sectionId) => (e) => {
    e.preventDefault();
    const title = new FormData(e.currentTarget).get("title");
    run(() => renameSection(sectionId, { title })).then((ok) => ok && setRenaming(null));
  };
  const handleDeleteSection = async (section) => {
    if ((await dialog.confirm({ title: `Delete section "${section.title}"?`, message: `Its ${plural(section.lessons.length, "lesson")} and their quizzes are deleted too. This cannot be undone.`, confirmLabel: "Delete section", danger: true }))) run(() => deleteSection(section.id));
  };
  const handleDeleteLesson = async (lesson) => {
    if ((await dialog.confirm({ title: `Delete lesson "${lesson.title}"?`, message: "Its video link, attachments and quiz are removed too. This cannot be undone.", confirmLabel: "Delete lesson", danger: true }))) run(() => deleteLesson(lesson.id));
  };
  const handleFlags = (lesson, flags) => run(() => setLessonFlags(lesson.id, flags));
  const handleAddQuiz = async (section, lesson) => {
    const title = await dialog.prompt({ title: lesson ? "Add a quiz after this lesson" : "Add a section quiz", message: lesson ? "Students unlock it after they finish the lesson." : "Students take it at the end of the section.", label: "Quiz title", defaultValue: lesson ? `${lesson.title} quiz` : `${section.title} quiz`, multiline: false, minLength: 2, confirmLabel: "Create quiz" });
    if (!title) return;
    const result = await run(() => createQuiz(courseId, { title, sectionId: section.id, lessonId: lesson?.id ?? null }));
    if (result) router.push(`/admin/courses/${courseId}/quizzes/${result.data.id}`);
  };
  const handlePublishAll = async () => {
    if ((await dialog.confirm({ title: "Publish every lesson?", message: "Enrolled students see them immediately and get a new-lesson email.", confirmLabel: "Publish all", danger: false }))) run(() => publishAllLessons(courseId));
  };

  const lessons = sections.flatMap((s) => s.lessons);
  const published = lessons.filter((l) => l.status === "published").length;
  const missingVideo = lessons.filter((l) => l.video?.status !== "ready").length;
  const duration = lessons.reduce((sum, l) => sum + (l.durationSec ?? 0), 0);
  const quizzes = sections.reduce((sum, s) => sum + s.quizzes.length + s.lessons.filter((l) => l.quiz).length, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon={Layers} label="Sections" value={sections.length} />
        <Stat icon={ListChecks} label={`Lessons (${published} published)`} value={lessons.length} />
        <Stat icon={Clock} label="Total length" value={formatDuration(duration)} />
        <Stat icon={FileQuestion} label="Quizzes" value={quizzes} />
        <Stat icon={missingVideo ? TriangleAlert : Video} tone={missingVideo ? "text-amber-300" : "text-green-400"} label="Lessons without video" value={missingVideo} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto flex items-center gap-2 text-sm text-white/50">
          <GripVertical className="hidden size-4 shrink-0 text-white/30 md:block" />
          <span className="hidden md:inline">Drag to reorder · open a lesson to add its video</span>
          <span className="md:hidden">Use ⋯ to reorder · tap a lesson to edit</span>
        </p>
        <button type="button" onClick={handleExpandAll} className={buttonClass("outline", "sm")}>
          Expand all
        </button>
        <button type="button" onClick={handleCollapseAll} className={buttonClass("outline", "sm")}>
          Collapse all
        </button>
        {published < lessons.length && (
          <button type="button" onClick={handlePublishAll} disabled={busy} className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3.5 py-1.5 text-sm text-accent hover:bg-accent hover:text-white disabled:opacity-50">
            <Send className="size-3.5" /> Publish all lessons
          </button>
        )}
      </div>

      <FormAlert>{error}</FormAlert>

      {sections.map((section, sIndex) => {
        const isOpen = !collapsed.has(section.id);
        const sectionDuration = section.lessons.reduce((sum, l) => sum + (l.durationSec ?? 0), 0);
        return (
          <section
            key={section.id}
            onDragOver={allowDrop}
            onDrop={handleDropOnSection(sIndex)}
            aria-label={`Section ${sIndex + 1}: ${section.title}`}
            className={`rounded-3xl border bg-[#0C0C0C] transition ${dragging ? "border-dashed border-accent/40" : "border-[#302C2A]"}`}
          >
            <header className="flex items-center gap-2 p-3 sm:p-4">
              <span
                draggable
                onDragStart={handleDragStart({ type: "section", id: section.id })}
                onDragEnd={handleDragEnd}
                className="hidden cursor-grab text-white/30 active:cursor-grabbing sm:block"
                aria-hidden="true"
              >
                <GripVertical className="size-5" />
              </span>
              {renaming === section.id ? (
                <form onSubmit={handleRename(section.id)} className="flex min-w-0 flex-1 flex-wrap gap-2">
                  <input name="title" defaultValue={section.title} autoFocus aria-label="Section title" className="min-w-0 flex-1 basis-40 rounded-lg border border-accent bg-[#070707] px-3 py-1.5 outline-hidden" />
                  <button className="rounded-lg bg-accent px-3 py-1.5 text-sm">Save</button>
                  <button type="button" onClick={() => setRenaming(null)} className="rounded-lg px-3 py-1.5 text-sm text-white/60 hover:bg-white/5">
                    Cancel
                  </button>
                </form>
              ) : (
                <button type="button" onClick={toggleSection(section.id)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/15 font-machina text-accent">{sIndex + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-machina text-lg sm:text-xl">{section.title}</span>
                    <span className="block text-xs text-white/45">
                      {plural(section.lessons.length, "lesson")}{sectionDuration > 0 && ` · ${formatDuration(sectionDuration)}`}
                      {section.quizzes.length > 0 && ` · ${section.quizzes.length} quiz`}
                    </span>
                  </span>
                  <ChevronDown className={`size-5 shrink-0 text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
              )}
              <ActionMenu
                label={`Actions for section ${section.title}`}
                items={[
                  { label: "Rename section", icon: Pencil, onClick: () => setRenaming(section.id) },
                  { label: "Add section quiz", icon: FileQuestion, onClick: () => handleAddQuiz(section) },
                  { label: "Move section up", icon: ArrowUp, onClick: () => moveSection(sIndex, -1), disabled: sIndex === 0 },
                  { label: "Move section down", icon: ArrowDown, onClick: () => moveSection(sIndex, 1), disabled: sIndex === sections.length - 1 },
                  { label: "Delete section", icon: Trash2, danger: true, onClick: () => handleDeleteSection(section) },
                ]}
              />
            </header>

            {isOpen && (
              <div className="flex flex-col gap-2 border-t border-white/5 p-3 sm:p-4">
                <ol className="flex flex-col gap-2">
                  {section.lessons.map((lesson, lIndex) => {
                    const video = videoState(lesson);
                    const isFirst = sIndex === 0 && lIndex === 0;
                    const isLast = sIndex === sections.length - 1 && lIndex === section.lessons.length - 1;
                    const lessonHref = `/admin/courses/${courseId}/lessons/${lesson.id}`;
                    return (
                      <li key={lesson.id} onDragOver={allowDrop} onDrop={handleDropOnLesson(sIndex, lIndex)} className="flex flex-col gap-2">
                        <div
                          draggable
                          onDragStart={handleDragStart({ type: "lesson", id: lesson.id })}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center gap-2 rounded-2xl border border-white/5 bg-[#070707] p-2 pl-3 transition hover:border-white/15 ${dragging?.id === lesson.id ? "opacity-40" : ""}`}
                        >
                          <GripVertical className="hidden size-4 shrink-0 cursor-grab text-white/25 sm:block" aria-hidden="true" />
                          <span className="w-8 shrink-0 text-xs tabular-nums text-white/35">
                            {sIndex + 1}.{lIndex + 1}
                          </span>
                          <video.icon className={`size-4 shrink-0 ${video.tone}`} aria-label={video.label} />
                          <Link href={lessonHref} className="min-w-0 flex-1 py-1 hover:text-accent">
                            <span className="block truncate">{lesson.title}</span>
                            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/45">
                              <StatusPill status={lesson.status} />
                              {lesson.isFreePreview && (
                                <span className="flex items-center gap-1 text-accent">
                                  <Eye className="size-3" /> Free preview
                                </span>
                              )}
                              {lesson.durationSec > 0 && <span>{formatDuration(lesson.durationSec)}</span>}
                              {!lesson.video?.provider && <span className="text-amber-300/80">Add video</span>}
                            </span>
                          </Link>
                          <Link href={lessonHref} aria-label={`Edit ${lesson.title}`} title="Edit lesson and video" className="hidden size-9 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-white sm:grid">
                            <Pencil className="size-4" />
                          </Link>
                          <ActionMenu
                            label={`Actions for lesson ${lesson.title}`}
                            items={[
                              { label: "Edit lesson & video", icon: Pencil, href: lessonHref },
                              lesson.status === "published"
                                ? { label: "Unpublish", icon: Undo2, onClick: () => handleFlags(lesson, { status: "draft" }) }
                                : { label: "Publish", icon: Send, onClick: () => handleFlags(lesson, { status: "published" }) },
                              lesson.isFreePreview
                                ? { label: "Remove free preview", icon: EyeOff, onClick: () => handleFlags(lesson, { isFreePreview: false }) }
                                : { label: "Make free preview", icon: Eye, onClick: () => handleFlags(lesson, { isFreePreview: true }) },
                              lesson.quiz
                                ? { label: "Edit lesson quiz", icon: FileQuestion, href: `/admin/courses/${courseId}/quizzes/${lesson.quiz.id}` }
                                : { label: "Add quiz after this lesson", icon: FileQuestion, onClick: () => handleAddQuiz(section, lesson) },
                              { label: "Move up", icon: ArrowUp, onClick: () => moveLesson(sIndex, lIndex, -1), disabled: isFirst },
                              { label: "Move down", icon: ArrowDown, onClick: () => moveLesson(sIndex, lIndex, 1), disabled: isLast },
                              ...sections
                                .map((target, tIndex) => tIndex !== sIndex && { label: `Move to ${tIndex + 1}. ${target.title}`, icon: FolderInput, onClick: () => moveLessonTo(sIndex, lIndex, tIndex) })
                                .filter(Boolean),
                              { label: "Delete lesson", icon: Trash2, danger: true, onClick: () => handleDeleteLesson(lesson) },
                            ]}
                          />
                        </div>
                        {lesson.quiz && <QuizRow courseId={courseId} quiz={lesson.quiz} label="Quiz after lesson" nested />}
                      </li>
                    );
                  })}
                </ol>
                {section.quizzes.map((quiz) => (
                  <QuizRow key={quiz.id} courseId={courseId} quiz={quiz} label="Section quiz" />
                ))}
                {section.lessons.length === 0 && section.quizzes.length === 0 && (
                  <p className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/40">
                    <CircleDashed className="size-5" /> Drop lessons here or add the first one below.
                  </p>
                )}
                <div className="mt-1">
                  <InlineAdd placeholder="New lesson title" onAdd={handleAddLesson(section.id)} button="Lesson" />
                </div>
              </div>
            )}
          </section>
        );
      })}

      <div className="rounded-3xl border border-dashed border-[#302C2A] p-3 sm:p-4">
        <InlineAdd placeholder="New section title, e.g. Getting Started" onAdd={handleAddSection} button="Section" />
      </div>
    </div>
  );
};

export default SyllabusBuilder;
