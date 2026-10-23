"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import MuxPlayer from "@mux/mux-player-react/lazy";
import { Loader2, Lock, MonitorX, ShieldCheck } from "lucide-react";
import { claimStream, streamHeartbeat } from "@/features/video/actions";
import { saveProgress } from "@/features/progress/actions";
import { btn } from "@/lib/ui";

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
  busy: "Too many requests. Wait a moment and reload.",
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
  <div className="grid aspect-video w-full place-items-center rounded-2xl border border-[#302C2A] bg-[#0C0C0C] p-6 text-center text-white/70">
    <div className="flex flex-col items-center gap-3">
      <Icon className="size-8 text-accent" />
      {children}
    </div>
  </div>
);

const Watermark = ({ viewer }) => {
  const [pos, setPos] = useState({ top: 8, left: 6 });

  useEffect(() => {
    const id = setInterval(() => setPos({ top: 5 + Math.random() * 80, left: 5 + Math.random() * 60 }), 4000);
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

const TiledMark = ({ viewer }) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 grid select-none grid-cols-3 grid-rows-3 place-items-center overflow-hidden text-[10px] text-white/[0.07] sm:text-sm">
    {Array.from({ length: 9 }, (_, i) => (
      <span key={i} className="-rotate-[20deg] whitespace-nowrap">
        {viewer.email} · #{viewer.tag}
      </span>
    ))}
  </div>
);

const SCREENSHOT_KEYS = (e) => e.key === "PrintScreen" || (e.metaKey && e.shiftKey && ["3", "4", "5", "6"].includes(e.key)) || (e.key?.toLowerCase() === "s" && e.shiftKey && (e.metaKey || e.getModifierState?.("OS")));

const useShield = (enabled, playerRef) => {
  const [shield, setShield] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const raise = () => {
      playerRef.current?.pause();
      setShield(true);
    };
    const handleVisibility = () => document.hidden && raise();
    const handleKey = (e) => {
      if (!SCREENSHOT_KEYS(e)) return;
      raise();
      navigator.clipboard?.writeText("").catch(() => null);
    };
    const handleBeforePrint = () => raise();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", raise);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);
    window.addEventListener("beforeprint", handleBeforePrint);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", raise);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
      window.removeEventListener("beforeprint", handleBeforePrint);
    };
  }, [enabled, playerRef]);

  return [shield, () => setShield(false)];
};

const VideoPlayer = ({ lessonId, title, onComplete, controllerRef, startAt }) => {
  const playerRef = useRef(null);
  const deviceRef = useRef(null);
  const trackRef = useRef({ last: null, watched: 0 });
  const resumeRef = useRef(null);
  const [blocked, setBlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { data, isPending, refetch } = useQuery({
    queryKey: ["playback", lessonId],
    queryFn: () => fetchPlayback(lessonId),
    staleTime: 10 * 60_000,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const guarded = Boolean(data?.viewer);
  const [shield, lowerShield] = useShield(guarded && data?.provider !== "embed", playerRef);

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

  useEffect(() => {
    if (!controllerRef) return;
    controllerRef.current = {
      getTime: () => Math.floor(playerRef.current?.currentTime ?? 0),
      seek: (sec) => {
        const player = playerRef.current;
        if (!player) return;
        player.currentTime = sec;
        player.play?.();
      },
    };
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

  const handleError = () => {
    if (data?.provider !== "mux" || resumeRef.current !== null) return;
    resumeRef.current = playerRef.current?.currentTime ?? 0;
    refetch();
  };

  const handleLoadedMetadata = () => {
    if (resumeRef.current === null) return;
    playerRef.current.currentTime = resumeRef.current;
    resumeRef.current = null;
  };

  const handleContextMenu = (e) => e.preventDefault();

  const handleShieldResume = () => {
    lowerShield();
    playerRef.current?.play();
  };

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
          <Link href="/login" className={btn.primary}>
            Sign in
          </Link>
        )}
      </Notice>
    );

  const containerId = `video-${lessonId}`;

  return (
    <div id={containerId} onContextMenu={handleContextMenu} onDragStart={handleContextMenu} className="relative aspect-video w-full select-none overflow-hidden rounded-2xl bg-black [-webkit-touch-callout:none] print:hidden">
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
          startTime={startAt ?? (data.startTime || undefined)}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onError={handleError}
          onLoadedMetadata={handleLoadedMetadata}
          disablePictureInPicture
          disableRemotePlayback
          className="size-full [--airplay-button:none] [--cast-button:none] [--pip-button:none]"
        />
      )}
      {data.viewer && <Watermark viewer={data.viewer} />}
      {data.viewer && <TiledMark viewer={data.viewer} />}
      {shield && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <ShieldCheck className="size-8 text-accent" />
            <p className="max-w-sm text-white">Paused. This video is protected and only plays while this window is in focus.</p>
            <button type="button" onClick={handleShieldResume} className={btn.primary}>
              Resume
            </button>
          </div>
        </div>
      )}
      {blocked && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <MonitorX className="size-8 text-accent" />
            <p className="max-w-sm text-white">Your account is playing a video on another device or tab. Only one stream is allowed at a time.</p>
            <button type="button" onClick={handleResume} className={btn.primary}>
              Watch here instead
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
