"use client";

import { CldUploadWidget } from "next-cloudinary";
import { FileText, ImagePlus, X } from "lucide-react";
import { UPLOAD_RULES } from "@/lib/upload-rules";

const cloudConfigured = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);

const ImageUpload = ({ kind, value, onChange, label, aspect }) => {
  const rule = UPLOAD_RULES[kind];

  if (!cloudConfigured) {
    return (
      <div className="flex flex-col gap-2 text-left">
        <span className="text-base text-white/70">{label}</span>
        <p className="rounded-xl border border-dashed border-white/20 p-3 text-sm text-white/50">Image uploads need Cloudinary keys in .env.local.</p>
      </div>
    );
  }

  const isDocument = rule.formats.includes("pdf") && rule.formats.length === 1;
  const handleSuccess = ({ info }) => onChange({ url: info.secure_url, publicId: info.public_id, name: `${info.original_filename}.${info.format}` });
  const handleRemove = () => onChange(null);

  return (
    <div className="flex flex-col gap-2 text-left">
      <span className="text-base text-white/70">{label}</span>
      <div className="flex items-center gap-4">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#302C2A] bg-[#0C0C0C]">
          {value?.url && !isDocument ? <img src={value.url} alt="" className="size-full object-cover" /> : isDocument ? <FileText className={`size-6 ${value?.url ? "text-accent" : "text-white/30"}`} /> : <ImagePlus className="size-6 text-white/30" />}
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
      {isDocument && value?.name && (
        <a href={value.url} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-accent hover:underline">
          {value.name}
        </a>
      )}
      <p className="text-xs text-white/40">
        {rule.formats.join(", ").toUpperCase()} · max {rule.maxBytes / 1024 / 1024} MB
      </p>
    </div>
  );
};

export default ImageUpload;
