import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { UPLOAD_RULES } from "@/lib/upload-rules";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const signParams = (kind, paramsToSign) => {
  const rule = UPLOAD_RULES[kind];
  if (!rule || paramsToSign?.upload_preset !== rule.preset) return null;
  return cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
};

export const destroyAsset = (publicId, kind) => {
  const rule = UPLOAD_RULES[kind] ?? {};
  return cloudinary.uploader
    .destroy(publicId, { resource_type: rule.resourceType ?? "image", type: rule.type ?? "upload", invalidate: true })
    .catch(() => null);
};

export const verifyUpload = async (kind, publicId) => {
  const rule = UPLOAD_RULES[kind];
  if (!rule || !publicId?.startsWith(`${rule.folder}/`)) return { ok: false, error: "Invalid upload" };
  const asset = await cloudinary.api.resource(publicId, { resource_type: rule.resourceType, type: rule.type ?? "upload" }).catch(() => null);
  if (!asset) return { ok: false, error: "Upload not found" };
  if (!rule.formats.includes(asset.format) || asset.bytes > rule.maxBytes) {
    await destroyAsset(publicId, kind);
    return { ok: false, error: `Only ${rule.formats.join(", ").toUpperCase()} up to ${rule.maxBytes / 1024 / 1024} MB` };
  }
  return { ok: true, asset: { url: asset.secure_url, publicId: asset.public_id, format: asset.format } };
};

export const privateDownloadUrl = (publicId, format, kind) =>
  cloudinary.utils.private_download_url(publicId, format, {
    resource_type: UPLOAD_RULES[kind]?.resourceType ?? "image",
    type: UPLOAD_RULES[kind]?.type ?? "upload",
    expires_at: Math.floor(Date.now() / 1000) + 300,
  });

export { cloudinary };
