"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Check, FileText, Undo2, X } from "lucide-react";
import { approveOrder, refundOrder, rejectOrder } from "@/features/payments/actions";
import ActionMenu from "@/components/ui/action-menu";
import DataTable from "@/components/ui/data-table";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatPrice } from "@/lib/format";
import TabList from "@/components/ui/tab-list";

const helper = createColumnHelper();

const filters = ["PENDING", "PAID", "FAILED", "REFUNDED", "ALL"];

const OrderActions = ({ order, onResult }) => {
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    onResult(await action());
    setBusy(false);
  };

  const handleApprove = () => {
    if (window.confirm(`Approve ${formatPrice(order.amount, order.currency)} from ${order.student} and enroll them in ${order.course}?`)) run(() => approveOrder(order.id));
  };

  const handleReject = () => {
    const note = window.prompt("Why is this payment rejected? The student will see this.");
    if (note) run(() => rejectOrder(order.id, { note }));
  };

  const handleRefund = () => {
    const note = window.prompt(`Refund ${formatPrice(order.amount, order.currency)} to ${order.student}? Their access to ${order.course} will be removed. Reason:`);
    if (note) run(() => refundOrder(order.id, { note }));
  };

  if (order.status === "PAID") return <ActionMenu label={`Actions for order by ${order.student}`} items={[{ label: "Mark refunded & remove access", icon: Undo2, danger: true, onClick: handleRefund }]} />;
  if (order.status !== "PENDING") return <span className="text-sm text-white/40">{order.note}</span>;

  return (
    <div className="flex gap-2">
      <button type="button" disabled={busy} onClick={handleApprove} className="flex items-center gap-1 rounded-full bg-green-500/15 px-3 py-1.5 text-sm text-green-300 hover:bg-green-500/25 disabled:opacity-50">
        <Check className="size-4" /> Approve
      </button>
      <button type="button" disabled={busy} onClick={handleReject} className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50">
        <X className="size-4" /> Reject
      </button>
    </div>
  );
};

const OrderTable = ({ orders }) => {
  const router = useRouter();
  const [filter, setFilter] = useState("PENDING");
  const [error, setError] = useState(null);
  const shown = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

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
          <span className="block text-sm text-white/45">{row.original.email}</span>
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
          <span className="block select-all text-sm text-white/45">{row.original.reference}</span>
        </span>
      ),
    }),
    helper.accessor("hasReceipt", {
      header: "Receipt",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.hasReceipt ? (
          <a href={`/api/admin/orders/${row.original.id}/receipt`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline">
            <FileText className="size-4" /> View
          </a>
        ) : (
          <span className="text-white/30">None</span>
        ),
    }),
    helper.accessor("createdAt", { header: "Date", sortingFn: "datetime", cell: ({ getValue }) => <span className="text-white/60">{formatDate(getValue())}</span> }),
    helper.accessor("status", { header: "Status", cell: ({ getValue }) => <StatusPill status={getValue()} /> }),
    helper.display({ id: "actions", header: "", cell: ({ row }) => <OrderActions order={row.original} onResult={handleResult} /> }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <TabList tabs={filters.map((f) => ({ value: f, label: `${f.charAt(0)}${f.slice(1).toLowerCase()} (${f === "ALL" ? orders.length : orders.filter((o) => o.status === f).length})` }))} value={filter} onChange={setFilter} label="Order status" size="sm" />
      <FormAlert>{error}</FormAlert>
      <DataTable key={filter} columns={columns} data={shown} searchPlaceholder="Search student, course or reference" empty="No orders here." />
    </div>
  );
};

export default OrderTable;
