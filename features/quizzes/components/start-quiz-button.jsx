"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { startAttempt } from "@/features/quizzes/student-actions";
import FormAlert from "@/components/ui/form-alert";
import { btn } from "@/lib/ui";

const StartQuizButton = ({ quizId, label }) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async () => {
    setBusy(true);
    setError(null);
    const result = await startAttempt(quizId);
    if (!result.ok) {
      setBusy(false);
      return setError(Object.values(result.errors).flat()[0]);
    }
    router.push(`/dashboard/quizzes/attempts/${result.data.attemptId}`);
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <FormAlert>{error}</FormAlert>
      <button type="button" onClick={handleStart} disabled={busy} className={btn.primary}>
        {busy ? <Loader2 className="size-5 animate-spin" /> : <Play className="size-5" />} {label}
      </button>
    </div>
  );
};

export default StartQuizButton;
