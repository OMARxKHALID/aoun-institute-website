"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus } from "lucide-react";
import { createStudyPlan } from "@/features/calendar/actions";
import { studyPlanSchema } from "@/features/calendar/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";

const StudyPlanForm = ({ courses, today }) => {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, setError, reset, formState } = useForm({
    resolver: zodResolver(studyPlanSchema),
    defaultValues: { date: today, time: "20:00", durationMin: 45, courseId: courses[0]?.value ?? "", title: "" },
  });
  const { errors, isSubmitting } = formState;

  const handleSave = async (values) => {
    setSaved(false);
    const result = await createStudyPlan(values);
    if (!result.ok) return Object.entries(result.errors).forEach(([field, messages]) => setError(field, { message: messages[0] }));
    reset({ ...values, title: "" });
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormAlert>{errors.root?.message}</FormAlert>
        {saved && <FormAlert type="success">Session planned. We will email you a reminder that morning.</FormAlert>}
      </div>
      <Field label="Date" type="date" min={today} error={errors.date?.message} {...register("date")} />
      <Field label="Time (Pakistan time)" type="time" error={errors.time?.message} {...register("time")} />
      <Field label="Course" options={[{ value: "", label: "Any course" }, ...courses]} error={errors.courseId?.message} {...register("courseId")} />
      <Field label="Minutes" type="number" min="5" max="600" step="5" error={errors.durationMin?.message} {...register("durationMin", { valueAsNumber: true })} />
      <Field label="What will you study? (optional)" className="sm:col-span-2" error={errors.title?.message} {...register("title")} />
      <Button type="submit" loading={isSubmitting} className="self-start sm:col-span-2 sm:justify-self-start">
        <CalendarPlus className="size-4" /> Add to calendar
      </Button>
    </form>
  );
};

export default StudyPlanForm;
