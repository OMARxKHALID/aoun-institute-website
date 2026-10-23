"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { gradeSubmission } from "@/features/assignments/actions";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import PanelCard from "@/components/ui/panel-card";
import StatusPill from "@/components/ui/status-pill";
import { formatDate } from "@/lib/format";
import { inputClass, labelClass } from "@/lib/ui";

const GradeForm = ({ submission }) => {
  const router = useRouter();
  const [grade, setGrade] = useState(submission.grade ?? "");
  const [feedback, setFeedback] = useState(submission.feedback);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    const result = await gradeSubmission(submission.id, { grade: Number(grade), feedback });
    setBusy(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setError(null);
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSave} className="grid gap-3 sm:grid-cols-[8rem_1fr]">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Score / 100</span>
        <input type="number" min="0" max="100" required value={grade} onChange={(e) => setGrade(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Feedback</span>
        <textarea rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} className={inputClass} />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" loading={busy} disabled={grade === ""}>
          {submission.status === "graded" ? "Update grade" : "Save grade"}
        </Button>
        {saved && <span className="text-sm text-green-400">Saved. The student was notified.</span>}
      </div>
      <FormAlert>{error}</FormAlert>
    </form>
  );
};

const SubmissionReview = ({ submissions }) =>
  submissions.length ? (
    <div className="flex flex-col gap-4">
      {submissions.map((s) => (
        <PanelCard key={s.id} title={s.student}>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/50">
            <span>{s.email}</span>
            <span>· submitted {formatDate(s.submittedAt)}</span>
            {s.late && <StatusPill status="late" label="late" tone="amber" />}
            <StatusPill status={s.status === "graded" ? "PAID" : "PENDING"} label={s.status === "graded" ? `graded ${s.grade}/100` : "to grade"} />
          </div>
          {s.text && <p className="whitespace-pre-line break-words text-white/70">{s.text}</p>}
          {s.files.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {s.files.map((f) => (
                <li key={f.href}>
                  <a href={f.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-[#302C2A] px-3 py-1.5 text-sm hover:border-accent hover:text-accent">
                    <FileText className="size-4" /> {f.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <GradeForm submission={s} />
        </PanelCard>
      ))}
    </div>
  ) : (
    <p className="text-white/50">No submissions yet.</p>
  );

export default SubmissionReview;
