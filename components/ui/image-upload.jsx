"use client";

import { useState } from "react";
import { FileText, ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { MAX_SOURCE_IMAGE, UPLOAD_RULES, fileHref, imageUrl } from "@/lib/upload-rules";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const cloudConfigured = Boolean(cloudName && apiKey);

const toMb = (bytes) => `${Math.round(bytes / 1024 / 1024)} MB`;

const extension = (file) => {
  const ext = file.name.split(".").pop().toLowerCase();
  return ext === "jpeg" ? "jpg" : ext;
};

const sign = async (kind, paramsToSign) => {
  const res = await fetch(`/api/uploads/sign?kind=${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paramsToSign }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Could not start the upload.");
  return data.signature;
};

const send = (url, body, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      const data = (() => {
        try {
          return JSON.parse(xhr.responseText);
        } catch {
          return {};
        }
      })();
      if (xhr.status < 300) return resolve(data);
      reject(new Error(data.error?.message ?? "Upload failed. Try again."));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.send(body);
  });

const upload = async (kind, file, onProgress) => {
  const rule = UPLOAD_RULES[kind];
  const params = { timestamp: Math.floor(Date.now() / 1000), upload_preset: rule.preset };
  const signature = await sign(kind, params);
  const body = new FormData();
  Object.entries({ ...params, signature, api_key: apiKey, file }).forEach(([key, val]) => body.append(key, val));
  return send(`https://api.cloudinary.com/v1_1/${cloudName}/${rule.resourceType}/upload`, body, onProgress);
};

const ImageUpload = ({ kind, value, onChange, label, aspect, multiple = false, maxFiles = 1 }) => {
  const rule = UPLOAD_RULES[kind];
  const [progress, setProgress] = useState(null);
  const [queue, setQueue] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

  if (!cloudConfigured) {
    return (
      <div className="flex flex-col gap-2 text-left">
        <span className="text-base text-white/70">{label}</span>
        <p className="rounded-xl border border-dashed border-white/20 p-3 text-sm text-white/50">Uploads need Cloudinary keys in .env.local.</p>
      </div>
    );
  }

  const isPrivate = rule.type === "authenticated";
  const isDocument = isPrivate || (rule.formats.includes("pdf") && rule.formats.length === 1);
  const limit = rule.transformation ? MAX_SOURCE_IMAGE : rule.maxBytes;
  const busy = progress !== null;
  const accept = rule.formats.flatMap((f) => (f === "jpg" ? [".jpg", ".jpeg"] : [`.${f}`])).join(",");

  const problem = (file) => {
    if (!rule.formats.includes(extension(file))) return `${file.name}: choose a ${rule.formats.join(", ").toUpperCase()} file.`;
    if (file.size > limit) return `${file.name} is ${toMb(file.size)}. The limit is ${toMb(limit)}.`;
    return null;
  };

  const start = async (list) => {
    const files = [...(list ?? [])].slice(0, multiple ? maxFiles : 1);
    if (!files.length || busy) return;
    const errors = files.map(problem).filter(Boolean);
    const valid = files.filter((f) => !problem(f));
    setError(errors.join(" ") || null);
    if (!valid.length) return;
    const done = [];
    for (const [i, file] of valid.entries()) {
      setQueue({ current: i + 1, total: valid.length });
      setProgress(0);
      try {
        const info = await upload(kind, file, setProgress);
        done.push({ url: info.secure_url, publicId: info.public_id, name: `${info.original_filename}.${info.format}` });
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
        setError(errors.join(" "));
      }
    }
    setProgress(null);
    setQueue(null);
    if (done.length) onChange(multiple ? done : done[0]);
  };

  const handleFile = (e) => {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    start(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    start(e.dataTransfer.files);
  };

  const handleRemove = () => onChange(null);

  const zone = (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex min-h-24 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-4 text-center transition hover:border-accent focus-within:border-accent sm:min-w-56 ${dragging ? "border-accent bg-accent/5" : "border-white/25"} ${busy ? "pointer-events-none" : ""}`}
    >
      {busy ? <Loader2 className="size-6 animate-spin text-accent" /> : <UploadCloud className="size-6 text-accent" />}
      <span className="text-sm">
        {busy ? `Uploading${queue?.total > 1 ? ` ${queue.current} of ${queue.total}` : ""} · ${progress}%` : multiple ? "Drop files here or click to browse" : value?.url ? "Drop a new file or click to replace" : "Drop a file here or click to browse"}
      </span>
      <span className="text-xs text-white/45">
        {rule.formats.join(", ").toUpperCase()} · up to {toMb(limit)}
        {rule.transformation && ", resized automatically"}
        {multiple && maxFiles > 1 && ` · ${maxFiles} more allowed`}
      </span>
      {busy && (
        <span className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
          <span style={{ width: `${progress}%` }} className="block h-full bg-accent transition-[width]" />
        </span>
      )}
      <input type="file" accept={accept} multiple={multiple} onChange={handleFile} disabled={busy} className="sr-only" />
    </label>
  );

  const removeButton = value?.url && !busy && (
    <button type="button" onClick={handleRemove} aria-label={`Remove ${label ?? "file"}`} className="grid size-8 shrink-0 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-red-300">
      <X className="size-4" />
    </button>
  );

  const href = kind === "document" ? fileHref(value) : !isPrivate ? value?.url : null;

  return (
    <div className="flex flex-col gap-2 text-left">
      {label && <span className="text-base text-white/70">{label}</span>}
      {isDocument ? (
        <>
          {value?.url && !multiple && (
            <div className="flex items-center gap-3 rounded-xl border border-[#302C2A] bg-[#0C0C0C] py-2 pl-4 pr-2">
              <FileText className="size-5 shrink-0 text-accent" />
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-sm hover:text-accent">
                  {value.name ?? "View file"}
                </a>
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm">{value.name ?? "Uploaded file"}</span>
              )}
              {removeButton}
            </div>
          )}
          {zone}
        </>
      ) : (
        <div className="flex flex-wrap items-stretch gap-3">
          <div className="relative shrink-0">
            <div style={{ aspectRatio: aspect ?? 1 }} className="grid h-24 max-w-44 place-items-center overflow-hidden rounded-xl border border-[#302C2A] bg-[#0C0C0C]">
              {value?.url ? <img src={imageUrl(value.url, 360)} alt="" className="size-full object-cover" /> : <ImagePlus className="size-6 text-white/30" />}
            </div>
            {value?.url && !busy && (
              <button type="button" onClick={handleRemove} aria-label={`Remove ${label ?? "image"}`} className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border border-[#302C2A] bg-[#0C0C0C] text-white/60 transition hover:border-red-400/60 hover:text-red-300">
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {zone}
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default ImageUpload;
