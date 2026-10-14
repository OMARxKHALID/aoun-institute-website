"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { BookOpen } from "lucide-react";
import DataTable from "@/components/ui/data-table";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatPrice } from "@/lib/format";

const helper = createColumnHelper();

const columns = helper.columns([
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

const CourseTable = ({ courses, initialSearch }) => (
  <DataTable columns={columns} data={courses} searchPlaceholder="Search courses" initialSearch={initialSearch} empty="No courses yet. Create your first one." />
);

export default CourseTable;
