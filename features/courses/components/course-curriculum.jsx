"use client";

import { useState } from "react";
import { ChevronDown, Lock, PlayCircle } from "lucide-react";
import PreviewModal from "@/features/courses/components/preview-modal";
import { formatDuration, plural } from "@/lib/format";

const CourseCurriculum = ({ outline }) => {
  const [preview, setPreview] = useState(null);
  const [open, setOpen] = useState(() => new Set(outline[0] ? [outline[0].id] : []));

  const lessons = outline.flatMap((s) => s.lessons);
  const totalSec = lessons.reduce((sum, l) => sum + (l.durationSec || 0), 0);
  const previews = lessons.filter((l) => l.preview).length;
  const allOpen = open.size === outline.length;

  const handleOpen = (lesson) => () => setPreview(lesson);
  const handleClose = () => setPreview(null);
  const handleToggle = (id) => () =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const handleToggleAll = () => setOpen(allOpen ? new Set() : new Set(outline.map((s) => s.id)));

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-lg text-black/60">
          {plural(outline.length, "module")} · {plural(lessons.length, "lesson")}
          {totalSec > 0 && ` · ${formatDuration(totalSec)} total`}
          {previews > 0 && <span className="text-accent"> · {plural(previews, "free preview")}</span>}
        </p>
        <button type="button" onClick={handleToggleAll} className="rounded-full border border-black/15 px-4 py-1.5 text-base font-medium text-black/70 transition hover:border-accent hover:text-accent">
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {outline.map(({ id, title, lessons: items }, i) => {
        const isOpen = open.has(id);
        const sectionSec = items.reduce((sum, l) => sum + (l.durationSec || 0), 0);
        return (
          <div key={id} className={`rounded-2xl border bg-white transition-colors ${isOpen ? "border-accent/40" : "border-[#CACACA]/50"}`}>
            <button type="button" onClick={handleToggle(id)} aria-expanded={isOpen} className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left md:p-6">
              <span className="flex min-w-0 items-center gap-4">
                <span className="font-machina text-2xl text-accent md:text-3xl">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block text-xl font-medium md:text-2xl">{title}</span>
                  <span className="block text-base text-black/50">
                    {plural(items.length, "lesson")}
                    {sectionSec > 0 && ` · ${formatDuration(sectionSec)}`}
                  </span>
                </span>
              </span>
              <ChevronDown className={`size-6 shrink-0 text-black/50 transition-transform duration-300 ${isOpen ? "rotate-180 text-accent" : ""}`} />
            </button>
            <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <ul className="flex flex-col divide-y divide-black/5 overflow-hidden px-5 md:px-6">
                {items.map((lesson) => (
                  <li key={lesson.id} className="flex items-center gap-3 py-3 text-black/75 last:pb-5">
                    {lesson.preview ? <PlayCircle className="size-5 shrink-0 text-accent" /> : <Lock className="size-4 shrink-0 text-black/30" />}
                    <span className="min-w-0 flex-1">{lesson.title}</span>
                    {lesson.preview && (
                      <button type="button" onClick={handleOpen(lesson)} tabIndex={isOpen ? 0 : -1} className="rounded-full bg-accent/10 px-3 py-1 text-base font-medium text-accent hover:bg-accent hover:text-white">
                        Preview
                      </button>
                    )}
                    {lesson.durationSec > 0 && <span className="shrink-0 text-base tabular-nums text-black/45">{formatDuration(lesson.durationSec)}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}

      <PreviewModal lesson={preview} onClose={handleClose} />
    </div>
  );
};

export default CourseCurriculum;
