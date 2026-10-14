"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileQuestion, Loader2 } from "lucide-react";
import { createQuiz } from "@/features/quizzes/actions";
import { useDialog } from "@/components/ui/dialog-provider";

const AddQuizButton = ({ courseId, sectionId, lessonId, defaultTitle, label = "Add quiz" }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    const title = await dialog.prompt({ title: "Add a quiz after this lesson", message: "Students unlock it after they finish the lesson.", label: "Quiz title", defaultValue: defaultTitle, multiline: false, minLength: 2, confirmLabel: "Create quiz" });
    if (!title) return;
    setBusy(true);
    const result = await createQuiz(courseId, { title, sectionId, lessonId: lessonId ?? null });
    setBusy(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    router.push(`/admin/courses/${courseId}/quizzes/${result.data.id}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={handleClick} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-accent/40 px-4 py-2.5 text-sm text-accent transition hover:bg-accent/10 disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <FileQuestion className="size-4" />} {label}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default AddQuizButton;
