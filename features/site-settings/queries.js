import { cacheTag } from "next/cache";
import { connectDB, hasDatabase } from "@/lib/db";
import SiteSettings from "@/features/site-settings/model";
import { defaultSiteSettings } from "@/features/site-settings/defaults";

export const SITE_SETTINGS_TAG = "site-settings";

const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const mergeDefaults = (defaults, value) => {
  if (!isPlainObject(defaults) || !isPlainObject(value)) return value ?? defaults;
  return Object.fromEntries(Object.keys({ ...defaults, ...value }).map((key) => [key, mergeDefaults(defaults[key], value[key])]));
};

export const getSiteSettings = async () => {
  "use cache";
  cacheTag(SITE_SETTINGS_TAG);
  if (!hasDatabase && process.env.NODE_ENV !== "production") return defaultSiteSettings;
  await connectDB();
  const doc = await SiteSettings.findById("site").lean();
  if (!doc) return defaultSiteSettings;
  const { _id, __v, createdAt, updatedAt, ...settings } = doc;
  return mergeDefaults(defaultSiteSettings, JSON.parse(JSON.stringify(settings), (key, value) => (key === "_id" ? undefined : value)));
};
