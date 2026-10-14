"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSyllabus } from "@/features/courses/actions";
import { syllabusSchema } from "@/features/courses/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import FormAlert from "@/components/ui/form-alert";
import ArrayField from "@/components/ui/array-field";
import ImageUpload from "@/components/ui/image-upload";
import AttachmentsField from "@/components/ui/attachments-field";

const toRows = (list = []) => list.map((text) => ({ text }));

const SyllabusSettingsForm = ({ course }) => {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const { register, control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(syllabusSchema, undefined, { raw: true }),
    defaultValues: {
      outcomes: toRows(course.outcomes),
      prerequisites: toRows(course.prerequisites),
      sequentialUnlock: course.sequentialUnlock,
      certificateRule: { type: course.certificateRule?.type ?? "all", percent: course.certificateRule?.percent ?? 100, requireQuizzes: course.certificateRule?.requireQuizzes ?? true },
      syllabusFile: course.syllabusFile?.publicId ? course.syllabusFile : null,
      attachments: course.attachments ?? [],
    },
  });
  const { errors, isSubmitting } = formState;
  const ruleType = useWatch({ control, name: "certificateRule.type" });
  const shared = { control, register, errors };

  const handleSave = async (values) => {
    setSaved(false);
    const result = await updateSyllabus(course.id, values);
    if (!result.ok) return setError("root", { message: Object.values(result.errors).flat()[0] });
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate className="flex flex-col gap-6">
      <FormAlert>{errors.root?.message}</FormAlert>
      {saved && <FormAlert type="success">Syllabus settings saved. Enrolled students see the changes now.</FormAlert>}

      <ArrayField {...shared} name="outcomes" label="What students will learn" max={20} empty={{ text: "" }} columns={[{ name: "text", label: "Outcome", wide: true }]} />
      <ArrayField {...shared} name="prerequisites" label="Prerequisites" max={20} empty={{ text: "" }} columns={[{ name: "text", label: "Prerequisite", wide: true }]} />

      <fieldset className="grid min-w-0 gap-4 rounded-2xl border border-[#302C2A] p-5 md:grid-cols-2">
        <legend className="px-2 font-machina text-xl">Progress & certificate</legend>
        <Checkbox className="md:col-span-2" label="Sequential unlock" hint="Students must finish each lesson before the next one unlocks." {...register("sequentialUnlock")} />
        <Field label="Certificate rule" options={[{ value: "all", label: "Complete all lessons" }, { value: "percent", label: "Complete a percentage of lessons" }]} error={errors.certificateRule?.type?.message} {...register("certificateRule.type")} />
        {ruleType === "percent" && (
          <Field label="Completion threshold (%)" type="number" min="1" max="100" error={errors.certificateRule?.percent?.message} {...register("certificateRule.percent", { valueAsNumber: true })} />
        )}
        <Checkbox className="md:col-span-2" label="Required quizzes must be passed" hint="Quizzes marked 'required for certificate' must be passed to earn the certificate." {...register("certificateRule.requireQuizzes")} />
      </fieldset>

      <div className="grid gap-6 md:grid-cols-2">
        <Controller control={control} name="syllabusFile" render={({ field }) => <ImageUpload kind="document" label="Downloadable syllabus (PDF)" value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="attachments" render={({ field }) => <AttachmentsField label="Course resources (PDF)" value={field.value} onChange={field.onChange} error={errors.attachments?.message} />} />
      </div>

      <Button type="submit" loading={isSubmitting} className="self-start">
        Save Syllabus Settings
      </Button>
    </form>
  );
};

export default SyllabusSettingsForm;
