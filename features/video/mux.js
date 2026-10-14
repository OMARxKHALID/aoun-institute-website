import "server-only";
import Mux from "@mux/ts";

export const muxEnabled = Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);

const drmConfigurationId = process.env.MUX_DRM_CONFIGURATION_ID;
const playbackRestrictionId = process.env.MUX_PLAYBACK_RESTRICTION_ID;

export const mux = muxEnabled ? new Mux() : null;

export const createDirectUpload = (lessonId) =>
  mux.video.uploads.create({
    cors_origin: process.env.BETTER_AUTH_URL,
    new_asset_settings: {
      passthrough: lessonId,
      video_quality: drmConfigurationId ? "plus" : "basic",
      advanced_playback_policies: [drmConfigurationId ? { policy: "drm", drm_configuration_id: drmConfigurationId } : { policy: "signed" }],
    },
  });

const toStatus = (upload, asset) => {
  if (["errored", "cancelled", "timed_out"].includes(upload.status) || asset?.status === "errored") return "failed";
  if (asset?.status === "ready") return "ready";
  return asset ? "processing" : "uploading";
};

export const fetchUploadState = async (uploadId) => {
  const upload = await mux.video.uploads.retrieve(uploadId);
  const asset = upload.asset_id ? await mux.video.assets.retrieve(upload.asset_id) : null;
  return {
    status: toStatus(upload, asset),
    assetId: asset?.id,
    playbackId: asset?.playback_ids?.[0]?.id,
    drm: asset?.playback_ids?.[0]?.policy === "drm",
    durationSec: Math.round(asset?.duration ?? 0),
  };
};

export const deleteVideo = async (video) => {
  if (!mux || video?.provider !== "mux") return;
  if (video.assetId) return mux.video.assets.delete(video.assetId).catch(() => null);
  if (video.uploadId) return mux.video.uploads.cancel(video.uploadId).catch(() => null);
};

export const signPlayback = (playbackId, durationSec, drm) =>
  mux.jwt.signPlaybackId(playbackId, {
    expiration: `${Math.max(durationSec, 60) + 900}s`,
    type: drm ? ["video", "thumbnail", "storyboard", "drm_license"] : ["video", "thumbnail", "storyboard"],
    ...(playbackRestrictionId && { params: { playback_restriction_id: playbackRestrictionId } }),
  });
