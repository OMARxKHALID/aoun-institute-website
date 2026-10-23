"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { markNotificationsRead } from "@/features/notifications/actions";
import { formatDate } from "@/lib/format";
import { menuPanel } from "@/lib/ui";

const KEY = ["notifications"];

const fetchNotifications = () => fetch("/api/notifications").then((r) => (r.ok ? r.json() : { unread: 0, items: [] }));

const NotificationBell = () => {
  const id = useId();
  const queryClient = useQueryClient();
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const { data } = useQuery({ queryKey: KEY, queryFn: fetchNotifications, refetchInterval: 60_000 });
  const unread = data?.unread ?? 0;
  const items = data?.items ?? [];

  const handleToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: Math.max(8, Math.min(rect.right - 320, window.innerWidth - 328)) });
  };

  const handlePopover = async (e) => {
    if (e.newState !== "open" || !unread) return;
    await markNotificationsRead();
    queryClient.setQueryData(KEY, (old) => old && { unread: 0, items: old.items.map((n) => ({ ...n, read: true })) });
  };

  const close = () => document.getElementById(id)?.hidePopover();

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        onClick={handleToggle}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative grid size-11 shrink-0 place-items-center rounded-full border border-[#302C2A] bg-[#0C0C0C] text-white/70 transition hover:border-accent hover:text-white"
      >
        <Bell className="size-5" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-semibold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      <div id={id} popover="auto" onToggle={handlePopover} style={{ top: pos.top, left: pos.left }} className={`${menuPanel} w-80 max-w-[calc(100vw-16px)]`}>
        <p className="px-3 py-2 text-sm font-medium">Notifications</p>
        {items.length ? (
          <ul className="flex max-h-96 flex-col overflow-y-auto">
            {items.map((n) => {
              const body = (
                <>
                  <span className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />}
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{n.title}</span>
                      {n.text && <span className="line-clamp-2 block text-sm text-white/70">{n.text}</span>}
                      <span className="block text-xs text-white/50">{formatDate(n.createdAt)}</span>
                    </span>
                  </span>
                </>
              );
              return (
                <li key={n.id}>
                  {n.path ? (
                    <Link href={n.path} onClick={close} className="block rounded-lg px-3 py-2 transition hover:bg-white/[0.06]">
                      {body}
                    </Link>
                  ) : (
                    <div className="px-3 py-2">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-3 pb-3 text-sm text-white/50">Nothing new yet.</p>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
