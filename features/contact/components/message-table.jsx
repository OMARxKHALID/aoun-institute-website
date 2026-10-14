"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Archive, Mail, MailOpen, Trash2 } from "lucide-react";
import { deleteMessage, setMessageStatus } from "@/features/contact/actions";
import DataTable from "@/components/ui/data-table";
import ActionMenu from "@/components/ui/action-menu";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import TabList from "@/components/ui/tab-list";
import { formatDate } from "@/lib/format";
import { useDialog } from "@/components/ui/dialog-provider";

const helper = createColumnHelper();

const filters = ["new", "read", "archived", "all"];

const MessageTable = ({ messages }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [filter, setFilter] = useState("new");
  const [error, setError] = useState(null);
  const shown = filter === "all" ? messages : messages.filter((m) => m.status === filter);

  const run = async (action) => {
    const result = await action();
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setError(null);
    router.refresh();
  };

  const columns = helper.columns([
    helper.accessor("name", {
      header: "From",
      cell: ({ row }) => (
        <span>
          <span className="block font-medium">{row.original.name}</span>
          <span className="block text-sm text-white/45">{row.original.email}</span>
          {row.original.phone && <span className="block text-xs text-white/35">{row.original.phone}</span>}
        </span>
      ),
    }),
    helper.accessor("topic", { header: "Topic", cell: ({ getValue }) => getValue() || "—" }),
    helper.accessor("message", { header: "Message", cell: ({ getValue }) => <span className="line-clamp-3 block max-w-md whitespace-pre-line text-sm text-white/70">{getValue()}</span> }),
    helper.accessor("createdAt", { header: "Received", sortingFn: "datetime", cell: ({ getValue }) => <span className="text-white/60">{formatDate(getValue())}</span> }),
    helper.accessor("status", { header: "Status", cell: ({ getValue }) => <StatusPill status={getValue()} /> }),
    helper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <ActionMenu
            label={`Actions for message from ${m.name}`}
            items={[
              { label: "Reply by email", icon: Mail, href: `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic || "Your message"}`)}`, external: true },
              m.status === "new" ? { label: "Mark as read", icon: MailOpen, onClick: () => run(() => setMessageStatus(m.id, "read")) } : { label: "Mark as new", icon: Mail, onClick: () => run(() => setMessageStatus(m.id, "new")) },
              m.status !== "archived" && { label: "Archive", icon: Archive, onClick: () => run(() => setMessageStatus(m.id, "archived")) },
              { label: "Delete", icon: Trash2, danger: true, onClick: async () => (await dialog.confirm({ title: "Delete this message?", message: `From ${m.name}. This cannot be undone.`, confirmLabel: "Delete", danger: true })) && run(() => deleteMessage(m.id)) },
            ]}
          />
        );
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <TabList
        tabs={filters.map((f) => ({ value: f, label: `${f.charAt(0).toUpperCase()}${f.slice(1)} (${f === "all" ? messages.length : messages.filter((m) => m.status === f).length})` }))}
        value={filter}
        onChange={setFilter}
        label="Message status"
        size="sm"
      />
      <FormAlert>{error}</FormAlert>
      <DataTable key={filter} columns={columns} data={shown} searchPlaceholder="Search name, email or message" empty="No messages here." />
    </div>
  );
};

export default MessageTable;
