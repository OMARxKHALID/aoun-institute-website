"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import MuxPlayer from "@mux/mux-player-react/lazy";
import { Loader2, Lock, MonitorX } from "lucide-react";
import { claimStream, streamHeartbeat } from "@/features/video/actions";
import { saveProgress } from "@/features/progress/actions";

const HEARTBEAT_MS = 30_000;
const SAVE_MS = 15_000;

const messages = {
  "not-found": "This lesson is not available.",
  login: "Sign in to watch this lesson.",
  locked: "Enroll in this course to watch this lesson.",
  processing: "This video is still processing. Check back in a few minutes.",
  "no-video": "No video has been added to this lesson yet.",
  unavailable: "Video playback is not configured yet.",
  sequence: "Finish the previous lesson to unlock this one.",
};

const getDeviceId = () => {
  try {
    const saved = sessionStorage.getItem("aoun-device-id");
    if (saved) return saved;
    const id = crypto.randomUUID();
    sessionStorage.setItem("aoun-device-id", id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
};

const fetchPlayback = (lessonId) => fetch(`/api/lessons/${lessonId}/playback`).then((res) => res.json());

const Notice = ({ icon: Icon, children }) => (
  <div className="grid aspect-video w-full place-items-center rounded-2xl border border-white/10 bg-[#0C0C0C] p-6 text-center text-white/60">
    <div className="flex flex-col items-center gap-3">
      <Icon className="size-8 text-accent" />
      {children}
    </div>
  </div>
);

const Watermark = ({ viewer }) => {
  const [pos, setPos] = useState({ top: 8, left: 6 });

  useEffect(() => {
    const id = setInterval(() => setPos({ top: 5 + Math.random() * 80, left: 5 + Math.random() * 60 }), 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
      className="pointer-events-none absolute z-10 select-none text-[11px] leading-tight text-white/35 transition-all duration-[2000ms] sm:text-xs"
    >
      <p>{viewer.name}</p>
      <p>{viewer.email}</p>
      <p>#{viewer.tag}</p>
    </div>
  );
};

const VideoPlayer = ({ lessonId, title, onComplete }) => {
  const playerRef = useRef(null);
  const deviceRef = useRef(null);
  const trackRef = useRef({ last: null, watched: 0 });
  const [blocked, setBlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { data, isPending } = useQuery({
    queryKey: ["playback", lessonId],
    queryFn: () => fetchPlayback(lessonId),
    staleTime: 10 * 60_000,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const guarded = Boolean(data?.viewer);

  useEffect(() => {
    if (!guarded || !playing) return;
    const id = setInterval(async () => {
      const result = await streamHeartbeat(lessonId, deviceRef.current);
      if (result.ok) return;
      playerRef.current?.pause();
      setBlocked(true);
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [guarded, playing, lessonId]);

  const flush = async () => {
    const player = playerRef.current;
    const track = trackRef.current;
    if (!data?.track || !player || track.watched < 1) return;
    const watched = Math.round(track.watched);
    track.watched = 0;
    const result = await saveProgress(lessonId, { position: Math.floor(player.currentTime), watched, duration: Math.floor(player.duration || 0) });
    if (result.ok && result.data.completed) onComplete?.();
  };

  useEffect(() => {
    if (!data?.track || !playing) return;
    const id = setInterval(flush, SAVE_MS);
    return () => clearInterval(id);
  });

  const handleTimeUpdate = () => {
    const time = playerRef.current?.currentTime ?? 0;
    const track = trackRef.current;
    const delta = track.last == null ? 0 : time - track.last;
    if (delta > 0 && delta < 2) track.watched += delta;
    track.last = time;
  };

  const handleSeeking = () => {
    trackRef.current.last = null;
  };

  const handlePlay = async () => {
    setPlaying(true);
    if (!guarded) return;
    deviceRef.current ??= getDeviceId();
    await claimStream(lessonId, deviceRef.current);
  };

  const handlePause = () => {
    setPlaying(false);
    trackRef.current.last = null;
    flush();
  };

  const handleResume = () => {
    setBlocked(false);
    playerRef.current?.play();
  };

  const handleContextMenu = (e) => e.preventDefault();

  if (isPending)
    return (
      <Notice icon={Loader2}>
        <span>Loading video…</span>
      </Notice>
    );

  if (!data?.ok)
    return (
      <Notice icon={Lock}>
        <p>{messages[data?.reason] ?? "Could not load this video."}</p>
        {data?.reason === "login" && (
          <Link href="/login" className="rounded-full bg-accent px-5 py-2 text-white">
            Sign in
          </Link>
        )}
      </Notice>
    );

  const containerId = `video-${lessonId}`;

  return (
    <div id={containerId} onContextMenu={handleContextMenu} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      {data.provider === "embed" ? (
        <iframe src={data.src} title={title ?? data.title} allow="autoplay; fullscreen; encrypted-media" allowFullScreen className="size-full" />
      ) : (
        <MuxPlayer
          ref={playerRef}
          playbackId={data.playbackId}
          src={data.provider === "url" ? data.src : undefined}
          tokens={data.tokens}
          streamType="on-demand"
          title={title ?? data.title}
          metadataVideoTitle={title ?? data.title}
          metadataViewerUserId={data.viewer?.tag}
          accentColor="#E8602E"
          fullscreenElement={containerId}
          startTime={data.startTime || undefined}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          className="size-full [--pip-button:none]"
        />
      )}
      {data.viewer && <Watermark viewer={data.viewer} />}
      {blocked && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <MonitorX className="size-8 text-accent" />
            <p className="max-w-sm text-white/80">Your account is playing a video on another device or tab. Only one stream is allowed at a time.</p>
            <button type="button" onClick={handleResume} className="rounded-full bg-accent px-5 py-2 text-white">
              Watch here instead
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
