"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, EyeOff, MessageSquareReply, Trash2 } from "lucide-react";
import { deleteReview, replyToReview, setReviewStatus } from "@/features/reviews/actions";
import DataTable from "@/components/ui/data-table";
import ActionMenu from "@/components/ui/action-menu";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import Stars from "@/components/ui/stars";
import TabList from "@/components/ui/tab-list";
import { formatDate } from "@/lib/format";
import { useDialog } from "@/components/ui/dialog-provider";

const helper = createColumnHelper();

const filters = [
  { value: "all", label: "All" },
  { value: "low", label: "1–2 stars" },
  { value: "unanswered", label: "No reply" },
  { value: "hidden", label: "Hidden" },
];

const ReviewTable = ({ reviews, owner }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);
  const shown = reviews.filter((r) => filter === "all" || (filter === "low" && r.rating <= 2) || (filter === "unanswered" && !r.reply) || (filter === "hidden" && r.status === "hidden"));

  const run = async (action) => {
    const result = await action();
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setError(null);
    router.refresh();
  };

  const handleReply = async (r) => {
    const body = await dialog.prompt({ title: `Reply to ${r.studentName}`, message: "Your reply is shown under their review on the course page.", label: "Reply", defaultValue: r.reply, minLength: 2, confirmLabel: "Post reply" });
    if (body) run(() => replyToReview(r.id, { body }));
  };

  const columns = helper.columns([
    helper.accessor("studentName", {
      header: "Student",
      cell: ({ row }) => (
        <span>
          <span className="block font-medium">{row.original.studentName}</span>
          <span className="block text-sm text-white/50">{row.original.course}</span>
        </span>
      ),
    }),
    helper.accessor("rating", { header: "Rating", cell: ({ getValue }) => <Stars value={getValue()} /> }),
    helper.accessor("body", {
      header: "Review",
      cell: ({ row }) => (
        <span className="block max-w-md text-sm">
          <span className="line-clamp-3 text-white/70">{row.original.body || <span className="text-white/50">No text</span>}</span>
          {row.original.reply && <span className="mt-1 block truncate text-xs text-accent">Replied: {row.original.reply}</span>}
        </span>
      ),
    }),
    helper.accessor("createdAt", { header: "Date", sortingFn: "datetime", cell: ({ getValue }) => <span className="text-white/70">{formatDate(getValue())}</span> }),
    helper.accessor("status", { header: "Status", cell: ({ getValue }) => <StatusPill status={getValue() === "hidden" ? "draft" : "published"} label={getValue()} /> }),
    helper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <ActionMenu
            label={`Actions for review by ${r.studentName}`}
            items={[
              { label: r.reply ? "Edit reply" : "Reply", icon: MessageSquareReply, onClick: () => handleReply(r) },
              owner && (r.status === "published" ? { label: "Hide from course page", icon: EyeOff, onClick: () => run(() => setReviewStatus(r.id, "hidden")) } : { label: "Show on course page", icon: Eye, onClick: () => run(() => setReviewStatus(r.id, "published")) }),
              r.slug && { label: "View course page", icon: Eye, href: `/courses/${r.slug}#reviews`, external: true },
              owner && { label: "Delete", icon: Trash2, danger: true, onClick: async () => (await dialog.confirm({ title: "Delete this review?", message: `${r.rating}-star review by ${r.studentName}. This cannot be undone.`, confirmLabel: "Delete", danger: true })) && run(() => deleteReview(r.id)) },
            ]}
          />
        );
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <TabList tabs={filters.map((f) => ({ ...f, label: `${f.label} (${reviews.filter((r) => f.value === "all" || (f.value === "low" && r.rating <= 2) || (f.value === "unanswered" && !r.reply) || (f.value === "hidden" && r.status === "hidden")).length})` }))} value={filter} onChange={setFilter} label="Review filter" size="sm" />
      <FormAlert>{error}</FormAlert>
      <DataTable key={filter} columns={columns} data={shown} searchPlaceholder="Search student, course or text" empty="No reviews here." />
    </div>
  );
};

export default ReviewTable;
