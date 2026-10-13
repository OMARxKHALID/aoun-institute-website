"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";
import { UPLOAD_RULES } from "@/lib/upload-rules";

const ImageUpload = ({ kind, value, onChange, label, aspect }) => {
  const rule = UPLOAD_RULES[kind];

  const handleSuccess = ({ info }) => onChange({ url: info.secure_url, publicId: info.public_id });
  const handleRemove = () => onChange(null);

  return (
    <div className="flex flex-col gap-2 text-left">
      <span className="text-base text-white/70">{label}</span>
      <div className="flex items-center gap-4">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#302C2A] bg-[#0C0C0C]">
          {value?.url ? <img src={value.url} alt="" className="size-full object-cover" /> : <ImagePlus className="size-6 text-white/30" />}
        </div>
        <CldUploadWidget
          uploadPreset={rule.preset}
          signatureEndpoint={`/api/uploads/sign?kind=${kind}`}
          options={{
            sources: ["local", "url"],
            multiple: false,
            maxFiles: 1,
            clientAllowedFormats: rule.formats,
            maxFileSize: rule.maxBytes,
            cropping: Boolean(aspect),
            croppingAspectRatio: aspect,
            showSkipCropButton: false,
          }}
          onSuccess={handleSuccess}
        >
          {({ open }) => (
            <button type="button" onClick={() => open()} className="rounded-xl border border-white/25 px-4 py-2 text-sm transition hover:border-accent hover:text-accent">
              {value?.url ? "Replace" : "Upload"}
            </button>
          )}
        </CldUploadWidget>
        {value?.url && (
          <button type="button" onClick={handleRemove} aria-label={`Remove ${label}`} className="rounded-xl p-2 text-white/50 transition hover:bg-white/5 hover:text-red-300">
            <X className="size-4" />
          </button>
        )}
      </div>
      <p className="text-xs text-white/40">
        {rule.formats.join(", ").toUpperCase()} · max {rule.maxBytes / 1024 / 1024} MB
      </p>
    </div>
  );
};

export default ImageUpload;
