import { v2 as cloudinary } from "cloudinary";
import { UPLOAD_RULES } from "../lib/upload-rules.js";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const toPreset = (rule) => ({
  name: rule.preset,
  unsigned: false,
  folder: rule.folder,
  allowed_formats: rule.formats.join(","),
  use_filename: false,
  unique_filename: true,
  overwrite: false,
  ...(rule.transformation && { transformation: [{ raw_transformation: rule.transformation }] }),
  ...(rule.type && { type: rule.type }),
});

const upsert = async (rule) => {
  const preset = toPreset(rule);
  const exists = await cloudinary.api.upload_preset(rule.preset).then(() => true).catch(() => false);
  await (exists ? cloudinary.api.update_upload_preset(rule.preset, preset) : cloudinary.api.create_upload_preset(preset));
  console.log(`${exists ? "updated" : "created"} ${rule.preset}`);
};

for (const rule of Object.values(UPLOAD_RULES)) await upsert(rule);
