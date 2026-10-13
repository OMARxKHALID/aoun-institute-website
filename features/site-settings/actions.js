"use server";

import { updateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { destroyAsset, verifyUpload } from "@/lib/cloudinary";
import SiteSettings from "@/features/site-settings/model";
import { siteSettingsSchema } from "@/features/site-settings/schemas";
import { SITE_SETTINGS_TAG } from "@/features/site-settings/queries";

const collectPublicIds = (value) => {
  if (!value || typeof value !== "object") return [];
  if (typeof value.publicId === "string") return [value.publicId];
  return Object.values(value).flatMap(collectPublicIds);
};

export const updateSiteSettings = async (input) => {
  await requireAdmin();
  const result = parse(siteSettingsSchema, input);
  if (!result.ok) return result;
  await connectDB();
  const previous = await SiteSettings.findById("site").lean();
  const before = new Set(collectPublicIds(previous));
  const after = collectPublicIds(result.data);
  const added = after.filter((id) => !before.has(id));
  const checks = await Promise.all(added.map((id) => verifyUpload("brand", id)));
  const rejected = checks.find((check) => !check.ok);
  if (rejected) return fail(rejected.error);
  await SiteSettings.findByIdAndUpdate("site", result.data, { upsert: true, runValidators: true });
  const removed = [...before].filter((id) => !after.includes(id));
  await Promise.all(removed.map((id) => destroyAsset(id, "brand")));
  updateTag(SITE_SETTINGS_TAG);
  return { ok: true };
};
