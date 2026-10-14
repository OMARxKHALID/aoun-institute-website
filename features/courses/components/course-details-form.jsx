"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourse, updateCourseDetails } from "@/features/courses/actions";
import { LEVELS, courseDetailsSchema, slugify } from "@/features/courses/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import ImageUpload from "@/components/ui/image-upload";

const blank = { title: "", slug: "", subtitle: "", description: "", category: "", level: "Beginner", price: 0, discountPrice: null, status: "draft", thumbnail: null };

const pick = (course) => Object.fromEntries(Object.keys(blank).map((key) => [key, course?.[key] ?? blank[key]]));

const numberOrNull = (value) => (value === "" || Number.isNaN(Number(value)) ? null : Number(value));

const CourseDetailsForm = ({ course }) => {
  const router = useRouter();
  const editing = Boolean(course);
  const [saved, setSaved] = useState(false);
  const [slugTouched, setSlugTouched] = useState(editing);
  const { register, control, handleSubmit, setError, setValue, formState } = useForm({ resolver: zodResolver(courseDetailsSchema), defaultValues: pick(course) });
  const { errors, isSubmitting } = formState;

  const titleField = register("title");
  const slugField = register("slug");

  const handleTitle = (e) => {
    titleField.onChange(e);
    if (!slugTouched) setValue("slug", slugify(e.target.value));
  };

  const handleSlug = (e) => {
    setSlugTouched(true);
    slugField.onChange(e);
  };

  const handleSave = async (values) => {
    setSaved(false);
    const result = editing ? await updateCourseDetails(course.id, values) : await createCourse(values);
    if (!result.ok) return Object.entries(result.errors).forEach(([field, messages]) => setError(field, { message: messages[0] }));
    if (!editing) return router.push(`/admin/courses/${result.data.id}`);
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate className="grid gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <FormAlert>{errors.root?.message}</FormAlert>
        {saved && <FormAlert type="success">Course details saved.</FormAlert>}
      </div>
      <Field label="Title" error={errors.title?.message} {...titleField} onChange={handleTitle} />
      <Field label="URL slug" error={errors.slug?.message} {...slugField} onChange={handleSlug} />
      <Field label="Subtitle" className="md:col-span-2" error={errors.subtitle?.message} {...register("subtitle")} />
      <Field label="Description" rows={6} className="md:col-span-2" error={errors.description?.message} {...register("description")} />
      <Field label="Category" placeholder="e.g. Development" error={errors.category?.message} {...register("category")} />
      <Field label="Level" options={LEVELS} error={errors.level?.message} {...register("level")} />
      <Field label="Price (PKR)" type="number" min="0" step="1" error={errors.price?.message} {...register("price", { valueAsNumber: true })} />
      <Field label="Discount price (optional)" type="number" min="0" step="1" error={errors.discountPrice?.message} {...register("discountPrice", { setValueAs: numberOrNull })} />
      <Field label="Status" options={["draft", "published"]} error={errors.status?.message} {...register("status")} />
      <Controller control={control} name="thumbnail" render={({ field }) => <ImageUpload kind="thumbnail" label="Thumbnail (16:9)" value={field.value} onChange={field.onChange} aspect={16 / 9} />} />
      {errors.thumbnail?.message && <p className="text-sm text-red-400 md:col-span-2">{errors.thumbnail.message}</p>}
      <Button type="submit" loading={isSubmitting} className="justify-self-start md:col-span-2">
        {editing ? "Save Details" : "Create Course"}
      </Button>
    </form>
  );
};

export default CourseDetailsForm;
