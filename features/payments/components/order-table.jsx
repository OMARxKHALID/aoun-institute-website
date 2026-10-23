"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Ban, Check, FileText, Undo2, X } from "lucide-react";
import { approveOrder, declineRefund, refundOrder, rejectOrder } from "@/features/payments/actions";
import ActionMenu from "@/components/ui/action-menu";
import { useDialog } from "@/components/ui/dialog-provider";
import DataTable from "@/components/ui/data-table";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatPrice } from "@/lib/format";
import TabList from "@/components/ui/tab-list";

const helper = createColumnHelper();

const filters = ["PENDING", "REFUND", "PAID", "REJECTED", "CANCELLED", "REFUNDED", "ALL"];

const filterLabels = { REFUND: "Refund requests" };

const refundOpen = (order) => order.status === "PAID" && order.refund?.status === "open";

const matches = (order, filter) => filter === "ALL" || (filter === "REFUND" ? refundOpen(order) : order.status === filter);

const OrderActions = ({ order, onResult }) => {
  const dialog = useDialog();
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    onResult(await action());
    setBusy(false);
  };

  const details = [
    ["Student", order.student],
    ["Course", order.course],
    ["Amount", formatPrice(order.amount, order.currency)],
    ["Method", order.method],
    ["Reference", order.reference || "—"],
    ...(order.refund?.reason ? [["Refund reason", order.refund.reason]] : []),
  ];

  const handleApprove = async () => {
    const ok = await dialog.confirm({
      title: "Approve this payment?",
      message: "Only approve after you see the money in your account. The student is enrolled and emailed right away.",
      details,
      confirmLabel: "Approve & enroll",
    });
    if (ok) run(() => approveOrder(order.id));
  };

  const handleReject = async () => {
    const note = await dialog.prompt({
      title: "Reject this payment?",
      message: "The student is emailed this reason and can submit their payment again.",
      details,
      label: "Reason",
      placeholder: "e.g. Transaction ID not found in our bank statement",
      minLength: 3,
      danger: true,
      confirmLabel: "Reject payment",
    });
    if (note) run(() => rejectOrder(order.id, { note }));
  };

  const handleRefund = async () => {
    const note = await dialog.prompt({
      title: "Refund and remove access?",
      message: "Send the money back first. The student loses access to the course and is emailed this reason.",
      details,
      label: "Reason",
      placeholder: "e.g. Duplicate payment",
      minLength: 3,
      danger: true,
      confirmLabel: "Mark refunded",
    });
    if (note) run(() => refundOrder(order.id, { note }));
  };

  const handleDecline = async () => {
    const note = await dialog.prompt({
      title: "Decline this refund request?",
      message: "The student keeps access and is emailed this reason.",
      details,
      label: "Reason",
      placeholder: "e.g. More than 7 days and most lessons watched",
      minLength: 3,
      confirmLabel: "Decline request",
    });
    if (note) run(() => declineRefund(order.id, { note }));
  };

  if (order.status === "PAID")
    return (
      <ActionMenu
        label={`Actions for order by ${order.student}`}
        items={[{ label: "Mark refunded & remove access", icon: Undo2, danger: true, onClick: handleRefund }, refundOpen(order) && { label: "Decline refund request", icon: Ban, onClick: handleDecline }]}
      />
    );
  if (order.status !== "PENDING") return <span className="text-sm text-white/50">{order.note}</span>;

  return (
    <div className="flex gap-2">
      <button type="button" disabled={busy} onClick={handleApprove} className="flex items-center gap-1 rounded-full bg-green-500/15 px-3 py-1.5 text-sm text-green-400 hover:bg-green-500/25 disabled:opacity-50">
        <Check className="size-4" /> Approve
      </button>
      <button type="button" disabled={busy} onClick={handleReject} className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50">
        <X className="size-4" /> Reject
      </button>
    </div>
  );
};

const OrderTable = ({ orders, initialSearch = "" }) => {
  const router = useRouter();
  const [filter, setFilter] = useState(initialSearch ? "ALL" : "PENDING");
  const [error, setError] = useState(null);
  const shown = orders.filter((o) => matches(o, filter));

  const handleResult = (result) => {
    setError(result.ok ? null : Object.values(result.errors).flat()[0]);
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
    helper.accessor("course", { header: "Course" }),
    helper.accessor("amount", { header: "Amount", cell: ({ row }) => formatPrice(row.original.amount, row.original.currency) }),
    helper.accessor("method", {
      header: "Payment",
      cell: ({ row }) => (
        <span>
          <span className="block">{row.original.method}</span>
          <span className="block select-all text-sm text-white/50">{row.original.reference}</span>
        </span>
      ),
    }),
    helper.accessor("hasReceipt", {
      header: "Receipt",
      enableSorting: false,
      meta: { className: "hidden xl:table-cell" },
      cell: ({ row }) =>
        row.original.hasReceipt ? (
          <a href={`/api/admin/orders/${row.original.id}/receipt`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline">
            <FileText className="size-4" /> View
          </a>
        ) : (
          <span className="text-white/50">None</span>
        ),
    }),
    helper.accessor("createdAt", { header: "Date", sortingFn: "datetime", meta: { className: "hidden xl:table-cell" }, cell: ({ getValue }) => <span className="text-white/70">{formatDate(getValue())}</span> }),
    helper.accessor("status", {
      header: "Status",
      cell: ({ row }) => (
        <span className="flex flex-col items-start gap-1">
          <StatusPill status={row.original.status} />
          {refundOpen(row.original) && <StatusPill status="refund" label="refund requested" tone="amber" />}
          {refundOpen(row.original) && <span className="line-clamp-2 max-w-56 text-xs text-white/50">{row.original.refund.reason}</span>}
        </span>
      ),
    }),
    helper.display({ id: "actions", header: "", cell: ({ row }) => <OrderActions order={row.original} onResult={handleResult} /> }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <TabList tabs={filters.map((f) => ({ value: f, label: `${filterLabels[f] ?? `${f.charAt(0)}${f.slice(1).toLowerCase()}`} (${orders.filter((o) => matches(o, f)).length})` }))} value={filter} onChange={setFilter} label="Order status" size="sm" />
      <FormAlert>{error}</FormAlert>
      <DataTable key={filter} columns={columns} data={shown} searchPlaceholder="Search student, course or reference" initialSearch={initialSearch} empty="No orders here." />
    </div>
  );
};

export default OrderTable;
