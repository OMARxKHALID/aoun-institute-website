"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronDown, Eye, FileQuestion, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { addLesson, addSection, deleteLesson, deleteSection, renameSection, reorderOutline } from "@/features/courses/actions";
import StatusPill from "@/components/ui/status-pill";
import FormAlert from "@/components/ui/form-alert";
import LessonForm from "@/features/courses/components/lesson-form";
import { formatDuration } from "@/lib/format";

const toOrder = (sections) => sections.map((s) => ({ id: s.id, lessonIds: s.lessons.map((l) => l.id) }));

const moveItem = (list, from, to) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const InlineAdd = ({ placeholder, onAdd }) => {
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
        className="min-w-0 flex-1 rounded-xl border border-[#302C2A] bg-[#070707] px-4 py-2.5 outline-hidden placeholder:text-white/30 focus:border-accent"
      />
      <button disabled={pending} className="flex items-center gap-1.5 rounded-xl bg-white/5 px-4 text-sm transition hover:bg-accent disabled:opacity-50">
        <Plus className="size-4" /> Add
      </button>
    </form>
  );
};

const IconButton = ({ label, children, className = "", ...props }) => (
  <button type="button" aria-label={label} title={label} className={`grid size-8 shrink-0 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-25 ${className}`} {...props}>
    {children}
  </button>
);

const SyllabusBuilder = ({ courseId, outline }) => {
  const router = useRouter();
  const [sections, setSections] = useState(outline);
  const [error, setError] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [dragging, setDragging] = useState(null);

  useEffect(() => setSections(outline), [outline]);

  const run = async (action) => {
    setError(null);
    const result = await action();
    if (!result.ok) {
      setError(Object.values(result.errors).flat()[0]);
      return false;
    }
    router.refresh();
    return true;
  };

  const commitOrder = async (next) => {
    const previous = sections;
    setSections(next);
    const ok = await run(() => reorderOutline(courseId, toOrder(next)));
    if (!ok) setSections(previous);
  };

  const moveSection = (index, delta) => commitOrder(moveItem(sections, index, index + delta));

  const moveLesson = (sIndex, lIndex, delta) => {
    const next = sections.map((s) => ({ ...s, lessons: [...s.lessons] }));
    const target = lIndex + delta;
    const [lesson] = next[sIndex].lessons.splice(lIndex, 1);
    if (target < 0) next[sIndex - 1].lessons.push(lesson);
    else if (target > next[sIndex].lessons.length) next[sIndex + 1].lessons.unshift(lesson);
    else next[sIndex].lessons.splice(target, 0, lesson);
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
    const next = sections.map((s) => ({ ...s, lessons: [...s.lessons] }));
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

  const handleAddSection = (title) => run(() => addSection(courseId, { title }));
  const handleAddLesson = (sectionId) => (title) => run(() => addLesson(sectionId, { title }));
  const handleRename = (sectionId) => (e) => {
    e.preventDefault();
    const title = new FormData(e.currentTarget).get("title");
    run(() => renameSection(sectionId, { title })).then((ok) => ok && setRenaming(null));
  };
  const handleDeleteSection = (section) => () => {
    if (window.confirm(`Delete "${section.title}" and its ${section.lessons.length} lessons? This cannot be undone.`)) run(() => deleteSection(section.id));
  };
  const handleDeleteLesson = (lesson) => () => {
    if (window.confirm(`Delete lesson "${lesson.title}"? This cannot be undone.`)) run(() => deleteLesson(lesson.id));
  };

  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-white/55">
        {sections.length} sections · {totalLessons} lessons. Drag rows to reorder, or use the arrow buttons. Changes are visible to enrolled students immediately.
      </p>
      <FormAlert>{error}</FormAlert>

      {sections.map((section, sIndex) => (
        <section
          key={section.id}
          onDragOver={allowDrop}
          onDrop={handleDropOnSection(sIndex)}
          aria-label={`Section ${sIndex + 1}: ${section.title}`}
          className={`rounded-3xl border bg-[#0C0C0C] p-4 transition md:p-5 ${dragging ? "border-dashed border-accent/40" : "border-[#302C2A]"}`}
        >
          <header className="flex flex-wrap items-center gap-2">
            <span draggable onDragStart={handleDragStart({ type: "section", id: section.id })} onDragEnd={handleDragEnd} className="cursor-grab text-white/30 active:cursor-grabbing" aria-hidden="true">
              <GripVertical className="size-5" />
            </span>
            <span className="grid size-8 place-items-center rounded-lg bg-accent/15 font-machina text-accent">{sIndex + 1}</span>
            {renaming === section.id ? (
              <form onSubmit={handleRename(section.id)} className="flex min-w-0 flex-1 gap-2">
                <input name="title" defaultValue={section.title} autoFocus aria-label="Section title" className="min-w-0 flex-1 rounded-lg border border-accent bg-[#070707] px-3 py-1.5 outline-hidden" />
                <button className="rounded-lg bg-accent px-3 text-sm">Save</button>
                <button type="button" onClick={() => setRenaming(null)} className="rounded-lg px-3 text-sm text-white/60 hover:bg-white/5">
                  Cancel
                </button>
              </form>
            ) : (
              <h3 className="min-w-0 flex-1 truncate font-machina text-xl">{section.title}</h3>
            )}
            <div className="ml-auto flex items-center">
              <IconButton label="Move section up" onClick={() => moveSection(sIndex, -1)} disabled={sIndex === 0}>
                <ArrowUp className="size-4" />
              </IconButton>
              <IconButton label="Move section down" onClick={() => moveSection(sIndex, 1)} disabled={sIndex === sections.length - 1}>
                <ArrowDown className="size-4" />
              </IconButton>
              <IconButton label="Rename section" onClick={() => setRenaming(section.id)}>
                <Pencil className="size-4" />
              </IconButton>
              <IconButton label="Delete section" onClick={handleDeleteSection(section)} className="hover:text-red-300">
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          </header>

          <ol className="mt-4 flex flex-col gap-2">
            {section.lessons.map((lesson, lIndex) => (
              <li key={lesson.id} onDragOver={allowDrop} onDrop={handleDropOnLesson(sIndex, lIndex)} className="flex flex-col gap-2">
                <div
                  draggable
                  onDragStart={handleDragStart({ type: "lesson", id: lesson.id })}
                  onDragEnd={handleDragEnd}
                  className={`flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-[#070707] px-3 py-2.5 ${dragging?.id === lesson.id ? "opacity-40" : ""}`}
                >
                  <GripVertical className="size-4 shrink-0 cursor-grab text-white/25" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                  <span className="flex flex-wrap items-center gap-2 text-sm text-white/45">
                    {lesson.isFreePreview && (
                      <span className="flex items-center gap-1 text-accent">
                        <Eye className="size-3.5" /> Preview
                      </span>
                    )}
                    {lesson.durationSec > 0 && <span>{formatDuration(lesson.durationSec)}</span>}
                    <StatusPill status={lesson.status} />
                  </span>
                  <span className="flex items-center">
                    <IconButton label="Move lesson up" onClick={() => moveLesson(sIndex, lIndex, -1)} disabled={sIndex === 0 && lIndex === 0}>
                      <ArrowUp className="size-4" />
                    </IconButton>
                    <IconButton label="Move lesson down" onClick={() => moveLesson(sIndex, lIndex, 1)} disabled={sIndex === sections.length - 1 && lIndex === section.lessons.length - 1}>
                      <ArrowDown className="size-4" />
                    </IconButton>
                    <IconButton label={editingLesson === lesson.id ? "Close lesson editor" : "Edit lesson"} onClick={() => setEditingLesson(editingLesson === lesson.id ? null : lesson.id)}>
                      <ChevronDown className={`size-4 transition-transform ${editingLesson === lesson.id ? "rotate-180" : ""}`} />
                    </IconButton>
                    <IconButton label="Delete lesson" onClick={handleDeleteLesson(lesson)} className="hover:text-red-300">
                      <Trash2 className="size-4" />
                    </IconButton>
                  </span>
                </div>
                {editingLesson === lesson.id && <LessonForm lesson={lesson} onDone={() => setEditingLesson(null)} />}
              </li>
            ))}
            {section.quizzes.map((quiz) => (
              <li key={quiz.id} className="flex items-center gap-2 rounded-2xl border border-dashed border-white/10 px-3 py-2.5 text-white/60">
                <FileQuestion className="size-4 text-accent" />
                <span className="flex-1 truncate">{quiz.title}</span>
                <StatusPill status={quiz.status} />
              </li>
            ))}
            {section.lessons.length === 0 && section.quizzes.length === 0 && <li className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/40">Drop lessons here or add one below.</li>}
          </ol>

          <div className="mt-3">
            <InlineAdd placeholder="New lesson title" onAdd={handleAddLesson(section.id)} />
          </div>
        </section>
      ))}

      <div className="rounded-3xl border border-dashed border-[#302C2A] p-4 md:p-5">
        <InlineAdd placeholder="New section title" onAdd={handleAddSection} />
      </div>
    </div>
  );
};

export default SyllabusBuilder;
