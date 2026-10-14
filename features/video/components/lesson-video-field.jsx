"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, UploadCloud } from "lucide-react";
import { refreshVideoStatus, removeVideo, setVideoLink, startVideoUpload } from "@/features/video/actions";
import VideoPlayer from "@/features/video/components/video-player";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";

const modes = [
  { id: "mux", label: "Upload (protected)" },
  { id: "embed", label: "YouTube / Vimeo" },
  { id: "url", label: "Video URL" },
];

const providerLabel = { mux: "Mux upload", embed: "YouTube / Vimeo embed", url: "Direct URL" };

const firstError = (result) => Object.values(result.errors ?? {}).flat()[0] ?? "Something went wrong";

const LessonVideoField = ({ lessonId, video }) => {
  const router = useRouter();
  const [mode, setMode] = useState(video?.provider ?? "mux");
  const [link, setLink] = useState(video?.provider === mode ? (video?.src ?? "") : "");
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const status = video?.status ?? "none";
  const pending = status === "uploading" || status === "processing";

  useEffect(() => {
    if (!pending || progress !== null) return;
    const id = setInterval(async () => {
      const result = await refreshVideoStatus(lessonId);
      if (result.ok && result.data.status !== status) router.refresh();
    }, 5000);
    return () => clearInterval(id);
  }, [pending, progress, status, lessonId, router]);

  const run = async (action) => {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) return setError(firstError(result));
    setPreview(false);
    router.refresh();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    const result = await startVideoUpload(lessonId);
    if (!result.ok) return setError(firstError(result));
    setProgress(0);
    const { createUpload } = await import("@mux/upchunk");
    const upload = createUpload({ endpoint: result.data.url, file, chunkSize: 30720 });
    upload.on("progress", ({ detail }) => setProgress(Math.round(detail)));
    upload.on("error", ({ detail }) => {
      setProgress(null);
      setError(detail?.message ?? "Upload failed");
    });
    upload.on("success", () => {
      setProgress(null);
      router.refresh();
    });
  };

  const handleSaveLink = () => run(() => setVideoLink(lessonId, { provider: mode, src: link }));

  const handleRemove = () => {
    if (window.confirm("Remove this lesson's video?")) run(() => removeVideo(lessonId));
  };

  const handleMode = (id) => () => {
    setMode(id);
    setLink(video?.provider === id ? (video?.src ?? "") : "");
  };

  return (
    <fieldset className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#302C2A] p-4">
      <legend className="px-2 text-base text-white/70">Video</legend>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <StatusPill status={progress !== null ? "uploading" : status} label={progress !== null ? `uploading ${progress}%` : undefined} />
        {video?.provider && <span className="text-white/50">{providerLabel[video.provider]}</span>}
        {video?.provider === "embed" && <span className="text-amber-300/80">Not protected: viewers can open it on YouTube or Vimeo.</span>}
        {status === "ready" && (
          <button type="button" onClick={() => setPreview((v) => !v)} className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-white/70 hover:bg-white/5 hover:text-white">
            {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {preview ? "Hide preview" : "Preview"}
          </button>
        )}
        {video?.provider && (
          <button type="button" onClick={handleRemove} disabled={busy} className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-red-300/80 hover:bg-red-500/10 ${status === "ready" ? "" : "ml-auto"}`}>
            <Trash2 className="size-4" /> Remove
          </button>
        )}
      </div>

      {preview && <VideoPlayer lessonId={lessonId} />}

      <FormAlert>{error}</FormAlert>

      <div role="tablist" className="flex flex-wrap gap-2">
        {modes.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={handleMode(id)}
            className={`rounded-xl px-3.5 py-1.5 text-sm transition ${mode === id ? "bg-white text-black" : "bg-white/5 text-white/60 hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "mux" ? (
        <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/25 p-6 text-center transition hover:border-accent ${progress !== null ? "pointer-events-none opacity-60" : ""}`}>
          <UploadCloud className="size-7 text-accent" />
          <span>{status === "none" ? "Choose a video file" : "Replace video"}</span>
          <span className="text-sm text-white/45">Uploads straight to Mux with signed playback and DRM. MP4, MOV or MKV.</span>
          <input type="file" accept="video/*" onChange={handleFile} disabled={progress !== null} className="sr-only" />
          {progress !== null && (
            <span className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <span style={{ width: `${progress}%` }} className="block h-full bg-accent transition-[width]" />
            </span>
          )}
        </label>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder={mode === "embed" ? "https://www.youtube.com/watch?v=…" : "https://…/video.m3u8 or .mp4"}
            aria-label={mode === "embed" ? "YouTube or Vimeo link" : "Video URL"}
            className="min-w-0 flex-1 rounded-xl border border-[#302C2A] bg-[#0C0C0C] px-4 py-3 text-white outline-hidden placeholder:text-white/30 focus:border-accent"
          />
          <Button type="button" variant="outline" loading={busy} onClick={handleSaveLink} disabled={!link}>
            Save link
          </Button>
        </div>
      )}
    </fieldset>
  );
};

export default LessonVideoField;
