"use client";

import { createContext, use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import VideoPlayer from "@/features/video/components/video-player";
import { markLessonComplete } from "@/features/progress/actions";
import { buttonClass } from "@/lib/ui";

export const CompleteButton = ({ lessonId, completed }) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setBusy(true);
    setError(null);
    const result = await markLessonComplete(lessonId);
    setBusy(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    router.refresh();
  };

  if (completed)
    return (
      <span className="flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-300">
        <CheckCircle2 className="size-4" /> Completed
      </span>
    );

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={handleClick} disabled={busy} className={buttonClass("outline")}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Mark as complete
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const controllerRef = useRef(null);
  return <PlayerContext value={controllerRef}>{children}</PlayerContext>;
};

const LessonPlayer = ({ lessonId, title, startAt }) => {
  const router = useRouter();
  const controllerRef = use(PlayerContext);
  const handleComplete = () => router.refresh();
  return <VideoPlayer lessonId={lessonId} title={title} onComplete={handleComplete} controllerRef={controllerRef} startAt={startAt} />;
};

export const usePlayerController = () => use(PlayerContext);

export default LessonPlayer;
