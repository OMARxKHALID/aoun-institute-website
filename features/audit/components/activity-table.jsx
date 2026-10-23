"use client";

import { useState } from "react";
import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/ui/data-table";
import StatusPill from "@/components/ui/status-pill";
import TabList from "@/components/ui/tab-list";

const helper = createColumnHelper();

const groups = [
  { value: "all", label: "All" },
  { value: "content", label: "Courses & quizzes", match: ["course", "section", "lesson", "quiz", "video"] },
  { value: "sales", label: "Orders", match: ["order"] },
  { value: "people", label: "Students", match: ["student", "review", "discussion"] },
  { value: "certificate", label: "Certificates", match: ["certificate"] },
  { value: "site", label: "Site & messages", match: ["settings", "announcement", "message"] },
];

const tone = { create: "green", approve: "green", issue: "green", unblock: "green", delete: "red", reject: "red", refund: "amber", revoke: "red", block: "red", revoke_access: "red" };

const targetHref = ({ targetType, targetId }) =>
  ({ course: `/admin/courses/${targetId}`, student: `/admin/students/${targetId}`, order: "/admin/orders", certificate: "/admin/certificates", message: "/admin/messages", settings: "/admin/settings" })[targetType];

const formatWhen = (value) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" }).format(new Date(value));

const columns = helper.columns([
  helper.accessor("createdAt", { header: "When", sortingFn: "datetime", cell: ({ getValue }) => <span className="whitespace-nowrap text-white/70">{formatWhen(getValue())}</span> }),
  helper.accessor("actorName", { header: "Who" }),
  helper.accessor("action", {
    header: "Action",
    cell: ({ getValue }) => {
      const [, verb = ""] = getValue().split(".");
      return <StatusPill status={getValue()} label={getValue().replace(".", " · ").replace("_", " ")} tone={tone[verb] ?? "gray"} />;
    },
  }),
  helper.accessor("summary", {
    header: "What happened",
    cell: ({ row }) => {
      const href = targetHref(row.original);
      return href ? (
        <Link href={href} className="hover:text-accent">
          {row.original.summary}
        </Link>
      ) : (
        row.original.summary
      );
    },
  }),
  helper.accessor("ip", { header: "IP", cell: ({ getValue }) => <span className="font-mono text-xs text-white/50">{getValue() ?? "—"}</span> }),
]);

const ActivityTable = ({ logs }) => {
  const [group, setGroup] = useState("all");
  const active = groups.find((g) => g.value === group);
  const shown = active.match ? logs.filter((l) => active.match.includes(l.action.split(".")[0])) : logs;
  return (
    <div className="flex flex-col gap-4">
      <TabList tabs={groups} value={group} onChange={setGroup} label="Activity type" size="sm" />
      <DataTable key={group} columns={columns} data={shown} searchPlaceholder="Search actions, people or details" empty="No admin activity yet." />
    </div>
  );
};

export default ActivityTable;
