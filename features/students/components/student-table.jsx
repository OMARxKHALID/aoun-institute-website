"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import DataTable from "@/components/ui/data-table";
import ActionMenu from "@/components/ui/action-menu";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/upload-rules";

const helper = createColumnHelper();

const statusLabel = { active: "active", banned: "banned", deletion: "wants deletion", unverified: "unverified" };

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const columns = helper.columns([
  helper.accessor("name", {
    header: "Student",
    cell: ({ row }) => (
      <Link href={`/admin/students/${row.original.id}`} className="flex items-center gap-3 hover:text-accent">
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-accent/15 text-sm font-semibold text-accent">
          {row.original.image ? <img src={imageUrl(row.original.image, 96)} alt="" className="size-full object-cover" /> : initials(row.original.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{row.original.name}</span>
          <span className="block truncate text-sm text-white/45">{row.original.email}</span>
        </span>
      </Link>
    ),
  }),
  helper.accessor("courses", { header: "Courses" }),
  helper.accessor("spent", { header: "Paid", cell: ({ getValue }) => formatPrice(getValue()) }),
  helper.accessor("joinedAt", { header: "Joined", sortingFn: "datetime", cell: ({ getValue }) => <span className="text-white/60">{formatDate(getValue())}</span> }),
  helper.accessor((row) => row.lastActiveAt ?? "", { id: "lastActiveAt", header: "Last active", cell: ({ row }) => <span className="text-white/60">{row.original.lastActiveAt ? formatDate(row.original.lastActiveAt) : "—"}</span> }),
  helper.accessor("status", { header: "Status", cell: ({ getValue }) => <StatusPill status={getValue()} label={statusLabel[getValue()]} /> }),
  helper.display({ id: "actions", header: "", cell: ({ row }) => <ActionMenu label={`Actions for ${row.original.name}`} items={[{ label: "View student", icon: Eye, href: `/admin/students/${row.original.id}` }]} /> }),
]);

const StudentTable = ({ students, initialSearch }) => <DataTable columns={columns} data={students} initialSearch={initialSearch} searchPlaceholder="Search name or email" empty="No students yet." />;

export default StudentTable;
