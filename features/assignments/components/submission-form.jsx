"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { submitAssignment } from "@/features/assignments/actions";
import AttachmentsField from "@/components/ui/attachments-field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import { inputClass, labelClass } from "@/lib/ui";

const SubmissionForm = ({ assignmentId, submission }) => {
  const router = useRouter();
  const graded = submission?.status === "graded";
  const [text, setText] = useState(submission?.text ?? "");
  const [files, setFiles] = useState(submission?.uploads ?? []);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const result = await submitAssignment(assignmentId, { text, files });
    setBusy(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setError(null);
    setSaved(true);
    router.refresh();
  };

  if (graded)
    return (
      <div className="flex flex-col gap-3">
        <p className="text-2xl font-medium">{submission.grade}/100</p>
        {submission.feedback && <p className="whitespace-pre-line text-white/70">{submission.feedback}</p>}
        {submission.files.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {submission.files.map((f) => (
              <li key={f.href}>
                <a href={f.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-[#302C2A] px-3 py-1.5 text-sm hover:border-accent hover:text-accent">
                  <FileText className="size-4" /> {f.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Your answer</span>
        <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your answer, or attach files below" className={inputClass} />
      </label>
      <AttachmentsField kind="submission" label="Files (PDF or images, up to 5)" value={files} onChange={setFiles} max={5} />
      <FormAlert>{error}</FormAlert>
      {saved && <FormAlert type="success">Submitted. Your teacher will grade it.</FormAlert>}
      <Button type="submit" size="lg" loading={busy} disabled={!text.trim() && !files.length} className="self-start">
        {submission ? "Update submission" : "Submit"}
      </Button>
    </form>
  );
};

export default SubmissionForm;
