"use client";

import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/data-table";
import ProgressBar from "@/components/ui/progress-bar";

const helper = createColumnHelper();

const columns = helper.columns([
  helper.accessor("number", { header: "#" }),
  helper.accessor("title", { header: "Lesson", cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> }),
  helper.accessor("started", { header: "Started" }),
  helper.accessor("completed", { header: "Completed" }),
  helper.accessor("completionRate", {
    header: "Completion",
    cell: ({ getValue }) => (
      <span className="flex min-w-32 items-center gap-2">
        <ProgressBar percent={getValue()} />
        <span className="w-10 text-right">{getValue()}%</span>
      </span>
    ),
  }),
  helper.accessor("avgWatched", { header: "Avg watched", cell: ({ getValue }) => `${getValue()}%` }),
  helper.accessor("questions", { header: "Questions" }),
]);

const LessonStatsTable = ({ lessons }) => <DataTable columns={columns} data={lessons} searchPlaceholder="Search lessons" empty="No published lessons yet." />;

export default LessonStatsTable;
