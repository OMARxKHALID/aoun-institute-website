"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/data-table";
import StatusPill from "@/components/ui/status-pill";
import { btn } from "@/lib/ui";

const helper = createColumnHelper();

const statusLabel = { passed: ["passed", "green"], available: ["ready", "accent"], retry: ["try again", "amber"], failed: ["no attempts left", "red"], locked: ["locked", "gray"] };

const columns = helper.columns([
  helper.accessor("title", {
    header: "Quiz",
    cell: ({ row }) => (
      <span>
        <span className="block font-medium">{row.original.title}</span>
        <span className="block text-sm text-white/50">After: {row.original.after}</span>
      </span>
    ),
  }),
  helper.accessor("course", { header: "Course" }),
  helper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const [label, tone] = statusLabel[getValue()];
      return <StatusPill status={getValue()} label={label} tone={tone} />;
    },
  }),
  helper.accessor((row) => row.best ?? -1, { id: "best", header: "Best score", cell: ({ row }) => (row.original.best == null ? <span className="text-white/50">—</span> : `${row.original.best}%`) }),
  helper.accessor("attempts", { header: "Attempts", cell: ({ row }) => `${row.original.attempts}${row.original.maxAttempts ? ` / ${row.original.maxAttempts}` : ""}` }),
  helper.display({
    id: "actions",
    header: "",
    cell: ({ row }) =>
      row.original.status === "locked" ? null : (
        <Link href={`/dashboard/quizzes/${row.original.id}`} className={btn.outline}>
          {row.original.status === "available" ? "Start" : "Open"}
        </Link>
      ),
  }),
]);

const StudentQuizTable = ({ quizzes }) => <DataTable columns={columns} data={quizzes} searchPlaceholder="Search quizzes" empty="No quizzes in your courses yet." />;

export default StudentQuizTable;
