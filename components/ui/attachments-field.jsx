"use client";

import { FileText, X } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { fileHref } from "@/lib/upload-rules";

const AttachmentsField = ({ value = [], onChange, label = "Attachments (PDF)", max = 10, error }) => {
  const handleAdd = (assets) => assets?.length && onChange([...value, ...assets].slice(0, max));
  const handleRemove = (publicId) => () => onChange(value.filter((a) => a.publicId !== publicId));

  return (
    <div className="flex flex-col gap-3">
      <span className="text-base text-white/70">{label}</span>
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((file) => (
            <li key={file.publicId} className="flex items-center gap-3 rounded-xl border border-[#302C2A] bg-[#0C0C0C] py-2 pl-4 pr-2">
              <FileText className="size-5 shrink-0 text-accent" />
              <a href={fileHref(file)} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-sm hover:text-accent">
                {file.name ?? file.publicId}
              </a>
              <button type="button" onClick={handleRemove(file.publicId)} aria-label={`Remove ${file.name ?? "file"}`} className="grid size-8 shrink-0 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-red-300">
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {value.length < max && <ImageUpload kind="document" value={null} onChange={handleAdd} multiple maxFiles={max - value.length} />}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default AttachmentsField;
