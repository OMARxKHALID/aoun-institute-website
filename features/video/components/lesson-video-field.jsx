"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, UploadCloud } from "lucide-react";
import { refreshVideoStatus, removeVideo, setVideoLink, startVideoUpload } from "@/features/video/actions";
import VideoPlayer from "@/features/video/components/video-player";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import TabList from "@/components/ui/tab-list";
import { useDialog } from "@/components/ui/dialog-provider";
import { inputClass } from "@/lib/ui";

const modes = [
  { id: "mux", label: "Upload (protected)" },
  { id: "embed", label: "YouTube / Vimeo" },
  { id: "url", label: "Video URL" },
];

const providerLabel = { mux: "Mux upload", embed: "YouTube / Vimeo embed", url: "Direct URL" };

const MAX_VIDEO_BYTES = 10 * 1024 ** 3;

const formatBytes = (bytes) => (bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : `${Math.max(1, Math.round(bytes / 1024 ** 2))} MB`);

const formatEta = (sec) => (sec >= 3600 ? `${Math.floor(sec / 3600)}h ${Math.round((sec % 3600) / 60)}m` : sec >= 60 ? `${Math.round(sec / 60)} min` : `${Math.max(1, Math.round(sec))} s`);

const firstError = (result) => Object.values(result.errors ?? {}).flat()[0] ?? "Something went wrong";

const LessonVideoField = ({ lessonId, video }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [mode, setMode] = useState(video?.provider ?? "mux");
  const [link, setLink] = useState(video?.provider === mode ? (video?.src ?? "") : "");
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [upload, setUpload] = useState(null);
  const uploadRef = useRef(null);
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

  useEffect(() => {
    if (progress === null) return;
    const handleLeave = (e) => e.preventDefault();
    window.addEventListener("beforeunload", handleLeave);
    return () => window.removeEventListener("beforeunload", handleLeave);
  }, [progress]);

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
    if (!file.type.startsWith("video/")) return setError("Choose a video file (MP4, MOV, MKV or WEBM).");
    if (file.size > MAX_VIDEO_BYTES) return setError(`This file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_VIDEO_BYTES)}; export it at a lower bitrate and try again.`);
    const result = await startVideoUpload(lessonId);
    if (!result.ok) return setError(firstError(result));
    setProgress(0);
    const started = Date.now();
    setUpload({ name: file.name, size: file.size, sent: 0, eta: null, offline: false });
    const { createUpload } = await import("@mux/upchunk");
    const chunked = createUpload({ endpoint: result.data.url, file, chunkSize: 30720, dynamicChunkSize: true, attempts: 10, delayBeforeAttempt: 3 });
    uploadRef.current = chunked;
    chunked.on("progress", ({ detail }) => {
      const sent = (detail / 100) * file.size;
      const rate = sent / Math.max(1, (Date.now() - started) / 1000);
      setProgress(Math.round(detail));
      setUpload((u) => u && { ...u, sent, eta: rate > 0 && detail < 100 ? (file.size - sent) / rate : null });
    });
    chunked.on("offline", () => setUpload((u) => u && { ...u, offline: true }));
    chunked.on("online", () => setUpload((u) => u && { ...u, offline: false }));
    chunked.on("error", ({ detail }) => {
      uploadRef.current = null;
      setProgress(null);
      setUpload(null);
      setError(detail?.message ?? "Upload failed. Check your connection and try again.");
    });
    chunked.on("success", () => {
      uploadRef.current = null;
      setProgress(null);
      setUpload(null);
      router.refresh();
    });
  };

  const handleCancelUpload = async () => {
    if (!(await dialog.confirm({ title: "Cancel this upload?", message: "The part already sent is discarded. You can upload again any time.", confirmLabel: "Cancel upload", cancelLabel: "Keep uploading", danger: true }))) return;
    uploadRef.current?.abort();
    uploadRef.current = null;
    setProgress(null);
    setUpload(null);
    run(() => removeVideo(lessonId));
  };

  const handleSaveLink = () => run(() => setVideoLink(lessonId, { provider: mode, src: link }));

  const handleRemove = async () => {
    if ((await dialog.confirm({ title: "Remove this video?", message: "Uploaded Mux videos are deleted from Mux too.", confirmLabel: "Remove video", danger: true }))) run(() => removeVideo(lessonId));
  };

  const handleMode = (id) => () => {
    setMode(id);
    setLink(video?.provider === id ? (video?.src ?? "") : "");
  };

  return (
    <fieldset className="flex min-w-0 flex-col gap-4">
      <legend className="mb-4 font-machina text-xl">Lesson video</legend>

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

      <TabList tabs={modes.map(({ id, label }) => ({ value: id, label }))} value={mode} onChange={(id) => handleMode(id)()} label="Video source" size="sm" />

      {upload && (
        <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-[#070707] p-4 text-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="min-w-0 flex-1 truncate font-medium">{upload.name}</span>
            <span className="text-white/55">
              {formatBytes(upload.sent)} of {formatBytes(upload.size)}
              {upload.eta != null && ` · about ${formatEta(upload.eta)} left`}
            </span>
          </div>
          {upload.offline && <p className="text-amber-300">Connection lost. The upload resumes automatically when you are back online.</p>}
          <p className="text-xs text-white/45">Keep this tab open until the upload finishes. Mux then processes the video, which can take a few minutes for long files.</p>
          <button type="button" onClick={handleCancelUpload} className="self-start text-red-300/80 hover:text-red-300">
            Cancel upload
          </button>
        </div>
      )}

      {mode === "mux" ? (
        <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/25 p-6 text-center transition hover:border-accent ${progress !== null ? "pointer-events-none opacity-60" : ""}`}>
          <UploadCloud className="size-7 text-accent" />
          <span>{status === "none" ? "Choose a video file" : "Replace video"}</span>
          <span className="text-sm text-white/45">Uploads straight to Mux in chunks with signed playback and DRM. MP4, MOV, MKV or WEBM up to 10 GB.</span>
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
            className={`min-w-0 flex-1 ${inputClass}`}
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
