"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { ClipboardList, Pencil, Trash2 } from "lucide-react";
import { deleteAssignment, saveAssignment } from "@/features/assignments/actions";
import { assignmentSchema } from "@/features/assignments/schemas";
import { STATUS_OPTIONS } from "@/features/courses/schemas";
import DataTable from "@/components/ui/data-table";
import ActionMenu from "@/components/ui/action-menu";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import PanelCard from "@/components/ui/panel-card";
import StatusPill from "@/components/ui/status-pill";
import { formatDate } from "@/lib/format";
import { useDialog } from "@/components/ui/dialog-provider";

const helper = createColumnHelper();

const blank = { courseId: "", title: "", instructions: "", dueOn: "", status: "draft" };

const AssignmentManager = ({ assignments, courses }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const { register, handleSubmit, setError: setFieldError, reset, formState } = useForm({ resolver: zodResolver(assignmentSchema), defaultValues: blank });
  const { errors, isSubmitting } = formState;

  const handleSave = async (values) => {
    setMessage(null);
    const result = await saveAssignment(editing, values);
    if (!result.ok) return Object.entries(result.errors).forEach(([field, messages]) => setFieldError(field, { message: messages[0] }));
    setMessage(editing ? "Assignment updated." : "Assignment created.");
    setEditing(null);
    reset(blank);
    router.refresh();
  };

  const handleEdit = (a) => {
    setEditing(a.id);
    setMessage(null);
    reset({ courseId: a.courseId, title: a.title, instructions: a.instructions, dueOn: a.dueOn, status: a.status });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditing(null);
    reset(blank);
  };

  const handleDelete = async (a) => {
    if (!(await dialog.confirm({ title: `Delete "${a.title}"?`, message: `Its ${a.submissions} submissions are deleted too.`, confirmLabel: "Delete", danger: true }))) return;
    const result = await deleteAssignment(a.id);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setError(null);
    router.refresh();
  };

  const columns = helper.columns([
    helper.accessor("title", {
      header: "Assignment",
      cell: ({ row }) => (
        <span>
          <span className="block font-medium">{row.original.title}</span>
          <span className="block text-sm text-white/50">{row.original.course}</span>
        </span>
      ),
    }),
    helper.accessor((row) => row.dueOn || "", { id: "dueOn", header: "Due", cell: ({ row }) => <span className="text-white/70">{row.original.dueOn ? formatDate(row.original.dueOn) : "No due date"}</span> }),
    helper.accessor("submissions", { header: "Submissions", cell: ({ row }) => `${row.original.submissions}${row.original.waiting ? ` · ${row.original.waiting} to grade` : ""}` }),
    helper.accessor("status", { header: "Status", cell: ({ getValue }) => <StatusPill status={getValue()} /> }),
    helper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <ActionMenu
          label={`Actions for ${row.original.title}`}
          items={[
            { label: "Review submissions", icon: ClipboardList, href: `/admin/assignments/${row.original.id}` },
            { label: "Edit", icon: Pencil, onClick: () => handleEdit(row.original) },
            { label: "Delete", icon: Trash2, danger: true, onClick: () => handleDelete(row.original) },
          ]}
        />
      ),
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PanelCard title={editing ? "Edit assignment" : "New assignment"}>
        <form onSubmit={handleSubmit(handleSave)} noValidate className="grid gap-4 md:grid-cols-2">
          <Field label="Course" options={courses} error={errors.courseId?.message} {...register("courseId")} />
          <Field label="Title" error={errors.title?.message} {...register("title")} />
          <Field label="Instructions" rows={5} className="md:col-span-2" error={errors.instructions?.message} {...register("instructions")} />
          <Field label="Due on (optional)" type="date" error={errors.dueOn?.message} {...register("dueOn")} />
          <Field label="Status" options={STATUS_OPTIONS} error={errors.status?.message} {...register("status")} />
          <div className="flex flex-col gap-3 md:col-span-2">
            <FormAlert>{errors.root?.message}</FormAlert>
            {message && <FormAlert type="success">{message}</FormAlert>}
            <div className="flex gap-2">
              <Button type="submit" loading={isSubmitting}>
                {editing ? "Save changes" : "Create assignment"}
              </Button>
              {editing && (
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </PanelCard>
      <FormAlert>{error}</FormAlert>
      <DataTable columns={columns} data={assignments} searchPlaceholder="Search assignments or courses" empty="No assignments yet." />
    </div>
  );
};

export default AssignmentManager;
