"use client";

import { useState } from "react";
import { Lock, PlayCircle } from "lucide-react";
import PreviewModal from "@/features/courses/components/preview-modal";
import { formatDuration, plural } from "@/lib/format";

const CourseCurriculum = ({ outline }) => {
  const [preview, setPreview] = useState(null);

  const handleOpen = (lesson) => () => setPreview(lesson);
  const handleClose = () => setPreview(null);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      {outline.map(({ id, title, lessons }, i) => (
        <details key={id} open={i === 0} className="group rounded-2xl border border-[#CACACA]/50 bg-white p-5 md:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-4">
              <span className="font-machina text-2xl text-accent md:text-3xl">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-xl font-medium md:text-2xl">{title}</span>
            </span>
            <span className="flex items-center gap-3 text-black/50">
              <span className="hidden text-base sm:inline">{plural(lessons.length, "lesson")}</span>
              <span className="text-2xl transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <ul className="mt-4 flex flex-col divide-y divide-black/5">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-3 py-3 text-black/75">
                {lesson.preview ? <PlayCircle className="size-5 shrink-0 text-accent" /> : <Lock className="size-4 shrink-0 text-black/30" />}
                <span className="min-w-0 flex-1">{lesson.title}</span>
                {lesson.preview && (
                  <button type="button" onClick={handleOpen(lesson)} className="rounded-full bg-accent/10 px-3 py-1 text-base font-medium text-accent hover:bg-accent hover:text-white">
                    Preview
                  </button>
                )}
                {lesson.durationSec > 0 && <span className="text-base text-black/45">{formatDuration(lesson.durationSec)}</span>}
              </li>
            ))}
          </ul>
        </details>
      ))}

      <PreviewModal lesson={preview} onClose={handleClose} />
    </div>
  );
};

export default CourseCurriculum;
