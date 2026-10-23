"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { createAnnouncement, deleteAnnouncement } from "@/features/announcements/actions";
import { announcementSchema } from "@/features/announcements/schemas";
import DataTable from "@/components/ui/data-table";
import ActionMenu from "@/components/ui/action-menu";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import FormAlert from "@/components/ui/form-alert";
import PanelCard from "@/components/ui/panel-card";
import { formatDate, plural } from "@/lib/format";
import { useDialog } from "@/components/ui/dialog-provider";

const helper = createColumnHelper();

const AnnouncementManager = ({ announcements, courses }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const { register, handleSubmit, setError: setFieldError, reset, formState } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: { courseId: "", title: "", body: "", email: true },
  });
  const { errors, isSubmitting } = formState;

  const handleCreate = async (values) => {
    setMessage(null);
    const result = await createAnnouncement(values);
    if (!result.ok) return Object.entries(result.errors).forEach(([field, messages]) => setFieldError(field, { message: messages[0] }));
    reset();
    setMessage(values.email ? `Posted and emailed to ${plural(result.data.sent, "student")}.` : "Posted.");
    router.refresh();
  };

  const handleDelete = async (a) => {
    if (!(await dialog.confirm({ title: `Delete "${a.title}"?`, message: "Students will no longer see it.", confirmLabel: "Delete", danger: true }))) return;
    const result = await deleteAnnouncement(a.id);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    router.refresh();
  };

  const columns = helper.columns([
    helper.accessor("title", {
      header: "Announcement",
      cell: ({ row }) => (
        <span className="block max-w-xl">
          <span className="block font-medium">{row.original.title}</span>
          <span className="line-clamp-2 block text-sm text-white/50">{row.original.body}</span>
        </span>
      ),
    }),
    helper.accessor("course", { header: "Course" }),
    helper.accessor("createdAt", { header: "Posted", sortingFn: "datetime", cell: ({ getValue }) => <span className="text-white/70">{formatDate(getValue())}</span> }),
    helper.display({ id: "actions", header: "", cell: ({ row }) => <ActionMenu label={`Actions for ${row.original.title}`} items={[{ label: "Delete", icon: Trash2, danger: true, onClick: () => handleDelete(row.original) }]} /> }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <PanelCard title="New announcement">
        <form onSubmit={handleSubmit(handleCreate)} noValidate className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormAlert>{errors.root?.message}</FormAlert>
            {message && <FormAlert type="success">{message}</FormAlert>}
          </div>
          <Field label="Course" options={courses} error={errors.courseId?.message} {...register("courseId")} />
          <Field label="Title" error={errors.title?.message} {...register("title")} />
          <Field label="Message" rows={4} className="md:col-span-2" error={errors.body?.message} {...register("body")} />
          <Checkbox className="md:col-span-2" label="Email enrolled students" hint="Students who turned off announcement emails will not get one." {...register("email")} />
          <Button type="submit" loading={isSubmitting} className="self-start md:col-span-2 md:justify-self-start">
            Post Announcement
          </Button>
        </form>
      </PanelCard>
      <FormAlert>{error}</FormAlert>
      <DataTable columns={columns} data={announcements} searchPlaceholder="Search announcements" empty="No announcements yet." />
    </div>
  );
};

export default AnnouncementManager;
