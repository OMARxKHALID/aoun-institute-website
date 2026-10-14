"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { BookOpen, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteCourse } from "@/features/courses/actions";
import DataTable from "@/components/ui/data-table";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatPrice } from "@/lib/format";

const helper = createColumnHelper();

const menuItem = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/5";

const RowActions = ({ course, onDelete }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const menuId = useId();

  const handleToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: Math.max(8, rect.right - 192) });
  };

  const handleDelete = () => {
    document.getElementById(menuId)?.hidePopover();
    onDelete(course);
  };

  return (
    <>
      <button
        type="button"
        popoverTarget={menuId}
        onClick={handleToggle}
        aria-label={`Actions for ${course.title}`}
        className="grid size-9 place-items-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-white"
      >
        <MoreHorizontal className="size-5" />
      </button>
      <div
        id={menuId}
        popover="auto"
        role="menu"
        style={{ top: pos.top, left: pos.left }}
        className="fixed m-0 w-48 rounded-xl border border-[#302C2A] bg-[#0C0C0C] p-1.5 text-white shadow-2xl"
      >
        <Link href={`/admin/courses/${course.id}`} role="menuitem" className={menuItem}>
          <Pencil className="size-4 text-white/50" /> Edit course
        </Link>
        {course.status === "published" && (
          <a href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer" role="menuitem" className={menuItem}>
            <ExternalLink className="size-4 text-white/50" /> View public page
          </a>
        )}
        <button type="button" role="menuitem" onClick={handleDelete} className={`${menuItem} text-red-300 hover:bg-red-500/10`}>
          <Trash2 className="size-4" /> Delete
        </button>
      </div>
    </>
  );
};

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
