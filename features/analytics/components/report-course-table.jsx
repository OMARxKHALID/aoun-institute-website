"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/data-table";
import ProgressBar from "@/components/ui/progress-bar";
import { formatPrice } from "@/lib/format";

const helper = createColumnHelper();

const columns = helper.columns([
  helper.accessor("title", {
    header: "Course",
    cell: ({ row }) => (
      <Link href={`/admin/courses/${row.original.id}`} className="font-medium hover:text-accent">
        {row.original.title}
      </Link>
    ),
  }),
  helper.accessor("revenue", { header: "Revenue", cell: ({ getValue }) => formatPrice(getValue()) }),
  helper.accessor("orders", { header: "Paid orders" }),
  helper.accessor("share", {
    header: "Share",
    cell: ({ getValue }) => (
      <span className="flex min-w-32 items-center gap-2">
        <ProgressBar percent={getValue()} />
        <span className="text-sm">{getValue()}%</span>
      </span>
    ),
  }),
]);

const ReportCourseTable = ({ rows }) => <DataTable columns={columns} data={rows} searchPlaceholder="Search courses" empty="No paid orders in this period." />;

export default ReportCourseTable;
