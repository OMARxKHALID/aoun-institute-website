"use client";

import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/data-table";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatDuration } from "@/lib/format";

const helper = createColumnHelper();

const columns = helper.columns([
  helper.accessor("student", {
    header: "Student",
    cell: ({ row }) => (
      <span>
        <span className="block font-medium">{row.original.student}</span>
        <span className="block text-sm text-white/45">{row.original.email}</span>
      </span>
    ),
  }),
  helper.accessor("attemptNo", { header: "Attempt" }),
  helper.accessor("percent", { header: "Score", cell: ({ row }) => `${row.original.percent}% (${row.original.score})` }),
  helper.accessor("passed", { header: "Result", cell: ({ getValue }) => <StatusPill status={getValue() ? "PAID" : "FAILED"} label={getValue() ? "passed" : "not passed"} /> }),
  helper.accessor("durationSec", { header: "Time taken", cell: ({ getValue }) => formatDuration(getValue()) }),
  helper.accessor("submittedAt", { header: "Submitted", sortingFn: "datetime", cell: ({ getValue }) => <span className="text-white/60">{getValue() ? formatDate(getValue()) : "—"}</span> }),
]);

const QuizResultsTable = ({ rows }) => <DataTable columns={columns} data={rows} searchPlaceholder="Search students" empty="No attempts yet." />;

export default QuizResultsTable;
