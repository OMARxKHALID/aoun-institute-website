"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import VideoPlayer from "@/features/video/components/video-player";

const PreviewModal = ({ lesson, onClose }) => {
  useEffect(() => {
    if (!lesson) return;
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lesson, onClose]);

  if (!lesson) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={lesson.title} className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex w-full max-w-4xl flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 text-white">
          <p className="truncate text-lg">{lesson.title}</p>
          <button type="button" onClick={onClose} aria-label="Close preview" className="rounded-full p-2 hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>
        <VideoPlayer lessonId={lesson.id} title={lesson.title} />
      </div>
    </div>
  );
};

export default PreviewModal;
