"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import PanelCard from "@/components/ui/panel-card";
import Pager from "@/components/ui/pager";
import { usePager } from "@/hooks/use-pager";
import { formatClock, formatDate } from "@/lib/format";

const NotesList = ({ notes }) => {
  const { shown, pager } = usePager(notes);
  const courses = Object.entries(Object.groupBy(shown, (n) => n.course));
  return (
    <div className="flex flex-col gap-5">
      {courses.map(([course, list]) => (
        <PanelCard key={course} title={course}>
          <ul className="flex flex-col gap-2">
            {list.map((n) => (
              <li key={n.id}>
                <Link href={`/dashboard/courses/${n.slug}/lessons/${n.lessonId}${n.sec ? `?t=${n.sec}` : ""}`} className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#070707] p-3 transition hover:border-accent/50">
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-xs text-accent">
                    <Play className="size-3" /> {formatClock(n.sec)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block whitespace-pre-line break-words text-sm text-white">{n.body}</span>
                    <span className="mt-1 block truncate text-xs text-white/50">
                      {n.lesson} · {formatDate(n.createdAt)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </PanelCard>
      ))}
      <Pager {...pager} />
    </div>
  );
};

export default NotesList;
