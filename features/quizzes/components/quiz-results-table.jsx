"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import { grantExtraAttempt } from "@/features/quizzes/actions";
import DataTable from "@/components/ui/data-table";
import ActionMenu from "@/components/ui/action-menu";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatDuration } from "@/lib/format";
import { useDialog } from "@/components/ui/dialog-provider";

const helper = createColumnHelper();

const QuizResultsTable = ({ rows, quizId, limited }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const handleGrant = async (row) => {
    if (!(await dialog.confirm({ title: `Give ${row.student} one more attempt?`, message: "They can take this quiz once more. The grant is logged.", confirmLabel: "Give attempt" }))) return;
    const result = await grantExtraAttempt(quizId, row.userId);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setError(null);
    setNotice(`${row.student} can take the quiz once more.`);
    router.refresh();
  };

  const columns = helper.columns([
    helper.accessor("student", {
      header: "Student",
      cell: ({ row }) => (
        <span>
          <span className="block font-medium">{row.original.student}</span>
          <span className="block text-sm text-white/50">{row.original.email}</span>
        </span>
      ),
    }),
    helper.accessor("attemptNo", { header: "Attempt" }),
    helper.accessor("percent", { header: "Score", cell: ({ row }) => `${row.original.percent}% (${row.original.score})` }),
    helper.accessor("passed", { header: "Result", cell: ({ getValue }) => <StatusPill status={getValue() ? "PAID" : "FAILED"} label={getValue() ? "passed" : "not passed"} /> }),
    helper.accessor("durationSec", { header: "Time taken", cell: ({ getValue }) => formatDuration(getValue()) }),
    helper.accessor("submittedAt", { header: "Submitted", sortingFn: "datetime", cell: ({ getValue }) => <span className="text-white/70">{getValue() ? formatDate(getValue()) : "—"}</span> }),
    limited &&
      helper.display({
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.canGrant ? (
            <ActionMenu label={`Actions for ${row.original.student}`} items={[{ label: "Give one more attempt", icon: RotateCcw, onClick: () => handleGrant(row.original) }]} />
          ) : null,
      }),
  ].filter(Boolean));

  return (
    <div className="flex flex-col gap-4">
      <FormAlert>{error}</FormAlert>
      {notice && <FormAlert type="success">{notice}</FormAlert>}
      <DataTable columns={columns} data={rows} searchPlaceholder="Search students" empty="No attempts yet." />
    </div>
  );
};

export default QuizResultsTable;
