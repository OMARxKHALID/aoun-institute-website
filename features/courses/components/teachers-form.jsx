"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCourseTeachers } from "@/features/courses/actions";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import FormAlert from "@/components/ui/form-alert";

const TeachersForm = ({ courseId, teachers, selected }) => {
  const router = useRouter();
  const [chosen, setChosen] = useState(new Set(selected));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleToggle = (id) => () => {
    setSaved(false);
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setBusy(true);
    const result = await setCourseTeachers(courseId, [...chosen]);
    setBusy(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setError(null);
    setSaved(true);
    router.refresh();
  };

  return (
    <section className="flex flex-col items-start gap-4 rounded-3xl border border-[#302C2A] p-6">
      <div>
        <h3 className="font-machina text-xl">Teachers</h3>
        <p className="text-white/70">Teachers manage this course's lessons, quizzes, questions and announcements. Make someone a teacher from their student page first.</p>
      </div>
      {teachers.length ? (
        <div className="grid w-full gap-2 sm:grid-cols-2">
          {teachers.map((t) => (
            <Checkbox key={t.value} label={t.label} hint={t.hint} checked={chosen.has(t.value)} onChange={handleToggle(t.value)} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/50">No teachers yet.</p>
      )}
      <FormAlert>{error}</FormAlert>
      {saved && <FormAlert type="success">Teachers saved.</FormAlert>}
      {teachers.length > 0 && (
        <Button type="button" loading={busy} onClick={handleSave}>
          Save teachers
        </Button>
      )}
    </section>
  );
};

export default TeachersForm;
