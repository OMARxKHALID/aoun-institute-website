"use client";

import { useState } from "react";
import { showProps } from "@/lib/ui";
import { Play } from "lucide-react";
import PreviewModal from "@/features/courses/components/preview-modal";
import { imageUrl } from "@/lib/upload-rules";

const CourseHeroMedia = ({ title, thumbnail, previewLesson }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div {...showProps} className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-[#302C2A] bg-[linear-gradient(135deg,#78350f,#1c1917_60%,#9a3412)]">
      {thumbnail && <img src={imageUrl(thumbnail, 1200)} alt={title} decoding="async" fetchPriority="high" className="size-full object-cover transition-transform duration-700 group-show:scale-[1.03]" />}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      {previewLesson && (
        <button type="button" onClick={handleOpen} className="absolute inset-0 flex flex-col items-center justify-center gap-3" aria-label={`Watch free preview: ${previewLesson.title}`}>
          <span className="grid size-16 place-items-center rounded-full bg-accent shadow-[0_0_40px_6px_rgba(232,96,46,0.45)] transition-transform duration-300 group-show:scale-110 md:size-20">
            <Play className="size-7 fill-white md:size-8" />
          </span>
          <span className="rounded-full bg-black/60 px-4 py-1.5 text-base backdrop-blur-sm">Watch free preview</span>
        </button>
      )}
      <PreviewModal lesson={open ? previewLesson : null} onClose={handleClose} />
    </div>
  );
};

export default CourseHeroMedia;
