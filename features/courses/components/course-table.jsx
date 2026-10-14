"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { BookOpen, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { deleteCourse } from "@/features/courses/actions";
import DataTable from "@/components/ui/data-table";
import ActionMenu from "@/components/ui/action-menu";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatPrice } from "@/lib/format";

const helper = createColumnHelper();

const RowActions = ({ course, onDelete }) => (
  <ActionMenu
    label={`Actions for ${course.title}`}
    items={[
      { label: "Edit course", icon: Pencil, href: `/admin/courses/${course.id}` },
      course.status === "published" && { label: "View public page", icon: ExternalLink, href: `/courses/${course.slug}`, external: true },
      { label: "Delete", icon: Trash2, danger: true, onClick: () => onDelete(course) },
    ]}
  />
);

const baseColumns = helper.columns([
  helper.accessor("title", {
    header: "Course",
    cell: ({ row }) => (
      <Link href={`/admin/courses/${row.original.id}`} className="flex items-center gap-3 hover:text-accent">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent/15 text-accent">
          {row.original.thumbnail?.url ? <img src={row.original.thumbnail.url} alt="" className="size-full object-cover" /> : <BookOpen className="size-5" />}
        </span>
        <span>
          <span className="block font-medium">{row.original.title}</span>
          <span className="block text-sm text-white/45">{row.original.category || "Uncategorized"}</span>
        </span>
      </Link>
    ),
  }),
  helper.accessor("status", { header: "Status", cell: ({ getValue }) => <StatusPill status={getValue()} /> }),
  helper.accessor((row) => row.discountPrice ?? row.price, {
    id: "price",
    header: "Price",
    cell: ({ row }) => (
      <span>
        {formatPrice(row.original.discountPrice ?? row.original.price)}
        {row.original.discountPrice != null && <span className="ml-2 text-sm text-white/40 line-through">{formatPrice(row.original.price)}</span>}
      </span>
    ),
  }),
  helper.accessor("lessons", { header: "Lessons" }),
  helper.accessor("students", { header: "Students" }),
  helper.accessor("updatedAt", { header: "Updated", sortingFn: "datetime", cell: ({ getValue }) => <span className="text-white/60">{formatDate(getValue())}</span> }),
]);

const CourseTable = ({ courses, initialSearch }) => {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}" with all its sections, lessons and quizzes? This cannot be undone.`)) return;
    setError(null);
    const result = await deleteCourse(course.id);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    router.refresh();
  };

  const columns = [...baseColumns, helper.display({ id: "actions", header: "", cell: ({ row }) => <RowActions course={row.original} onDelete={handleDelete} /> })];

  return (
    <div className="flex flex-col gap-4">
      <FormAlert>{error}</FormAlert>
      <DataTable columns={columns} data={courses} searchPlaceholder="Search courses" initialSearch={initialSearch} empty="No courses yet. Create your first one." />
    </div>
  );
};

export default CourseTable;
