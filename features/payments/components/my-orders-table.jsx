"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Undo2 } from "lucide-react";
import { requestRefund } from "@/features/payments/actions";
import DataTable from "@/components/ui/data-table";
import ActionMenu from "@/components/ui/action-menu";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatPrice } from "@/lib/format";
import { useDialog } from "@/components/ui/dialog-provider";

const helper = createColumnHelper();

const refundPill = {
  open: { label: "refund requested", tone: "amber" },
  approved: { label: "refunded", tone: "gray" },
  declined: { label: "refund declined", tone: "red" },
};

const MyOrdersTable = ({ orders }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const handleRefund = async (order) => {
    const reason = await dialog.prompt({
      title: `Request a refund for ${order.course}?`,
      message: "We review every request against our refund policy and email you the decision. If it is approved, your access to the course ends.",
      label: "Why do you want a refund?",
      placeholder: "e.g. I paid twice by mistake",
      minLength: 10,
      maxLength: 1000,
      confirmLabel: "Send request",
    });
    if (!reason) return;
    const result = await requestRefund(order.id, { reason });
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setError(null);
    setNotice("Refund request sent. We will email you the decision.");
    router.refresh();
  };

  const columns = helper.columns([
    helper.accessor("course", {
      header: "Course",
      cell: ({ row }) =>
        row.original.slug ? (
          <Link href={`/courses/${row.original.slug}`} className="font-medium hover:text-accent">
            {row.original.course}
          </Link>
        ) : (
          row.original.course
        ),
    }),
    helper.accessor("amount", { header: "Amount", cell: ({ row }) => formatPrice(row.original.amount, row.original.currency) }),
    helper.accessor("method", {
      header: "Payment",
      cell: ({ row }) => (
        <span>
          <span className="block">{row.original.method}</span>
          <span className="block text-sm text-white/50">{row.original.reference}</span>
        </span>
      ),
    }),
    helper.accessor("createdAt", { header: "Date", sortingFn: "datetime", cell: ({ getValue }) => <span className="text-white/70">{formatDate(getValue())}</span> }),
    helper.accessor("status", {
      header: "Status",
      cell: ({ row }) => {
        const { status, note, refund } = row.original;
        const pill = refund && status === "PAID" ? refundPill[refund.status] : null;
        return (
          <span className="flex flex-col items-start gap-1">
            <StatusPill status={status} label={status === "PENDING" ? "under review" : undefined} />
            {pill && <StatusPill status={refund.status} label={pill.label} tone={pill.tone} />}
            {note && <span className="text-xs text-red-400/80">{note}</span>}
            {refund?.status === "declined" && refund.note && <span className="text-xs text-red-400/80">{refund.note}</span>}
          </span>
        );
      },
    }),
    helper.display({
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.canRequestRefund ? <ActionMenu label={`Actions for ${row.original.course}`} items={[{ label: "Request a refund", icon: Undo2, onClick: () => handleRefund(row.original) }]} /> : null,
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <FormAlert>{error}</FormAlert>
      {notice && <FormAlert type="success">{notice}</FormAlert>}
      <DataTable columns={columns} data={orders} searchPlaceholder="Search orders" empty="No orders yet." />
    </div>
  );
};

export default MyOrdersTable;
