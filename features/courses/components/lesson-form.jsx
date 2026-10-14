"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateLesson } from "@/features/courses/actions";
import { lessonFormSchema } from "@/features/courses/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import FormAlert from "@/components/ui/form-alert";
import AttachmentsField from "@/components/ui/attachments-field";

const toMinutes = (seconds) => Math.round((seconds ?? 0) / 60);

const LessonForm = ({ lesson }) => {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const { register, control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: lesson.title,
      description: lesson.description ?? "",
      isFreePreview: lesson.isFreePreview,
      status: lesson.status,
      durationMin: toMinutes(lesson.durationSec),
      attachments: lesson.attachments ?? [],
    },
  });
  const { errors, isSubmitting } = formState;

  const handleSave = async ({ durationMin, ...values }) => {
    setSaved(false);
    const result = await updateLesson(lesson.id, { ...values, durationSec: Math.round(durationMin * 60) });
    if (!result.ok) return Object.entries(result.errors).forEach(([field, messages]) => setError(field, { message: messages[0] }));
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <FormAlert>{errors.root?.message}</FormAlert>
        {saved && <FormAlert type="success">Lesson saved.</FormAlert>}
      </div>
      <Field label="Lesson title" error={errors.title?.message} {...register("title")} />
      <Field label="Status" options={["draft", "published"]} error={errors.status?.message} {...register("status")} />
      <Field label="Description" rows={4} className="md:col-span-2" error={errors.description?.message} {...register("description")} />
      <Field label="Duration (minutes, auto-filled for uploads)" type="number" min="0" step="1" error={errors.durationMin?.message ?? errors.durationSec?.message} {...register("durationMin", { valueAsNumber: true })} />
      <Checkbox label="Free preview" hint="Anyone can watch this lesson before buying." {...register("isFreePreview")} />
      <div className="md:col-span-2">
        <Controller control={control} name="attachments" render={({ field }) => <AttachmentsField value={field.value} onChange={field.onChange} error={errors.attachments?.message} />} />
      </div>
      <div className="flex gap-3 md:col-span-2">
        <Button type="submit" loading={isSubmitting}>
          Save Lesson
        </Button>
      </div>
    </form>
  );
};

export default LessonForm;
