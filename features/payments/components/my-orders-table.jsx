"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/data-table";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatPrice } from "@/lib/format";

const helper = createColumnHelper();

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
    cell: ({ row }) => (
      <span className="flex flex-col items-start gap-1">
        <StatusPill status={row.original.status} label={row.original.status === "PENDING" ? "under review" : undefined} />
        {row.original.note && <span className="text-xs text-red-400/80">{row.original.note}</span>}
      </span>
    ),
  }),
]);

const MyOrdersTable = ({ orders }) => <DataTable columns={columns} data={orders} searchPlaceholder="Search orders" empty="No orders yet." />;

export default MyOrdersTable;
