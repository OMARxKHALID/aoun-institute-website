"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { deleteStudyPlan, toggleStudyPlan } from "@/features/calendar/actions";
import { formatDate } from "@/lib/format";

const PlanList = ({ plans, empty }) => {
  const router = useRouter();

  const run = (action) => async () => {
    await action();
    router.refresh();
  };

  if (!plans.length) return <p className="text-sm text-white/45">{empty}</p>;

  return (
    <ul className="flex flex-col gap-2">
      {plans.map((p) => (
        <li key={p.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#070707] p-3">
          <button type="button" onClick={run(() => toggleStudyPlan(p.id))} aria-label={p.done ? "Mark as not done" : "Mark as done"} aria-pressed={p.done} className="shrink-0">
            {p.done ? <CheckCircle2 className="size-5 text-green-400" /> : <Circle className="size-5 text-white/40 hover:text-accent" />}
          </button>
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-sm ${p.done ? "text-white/40 line-through" : ""}`}>{p.title}</span>
            <span className="block truncate text-xs text-white/45">
              {formatDate(p.startsAt)} · {p.time} · {p.durationMin} min
            </span>
          </span>
          <button type="button" onClick={run(() => deleteStudyPlan(p.id))} aria-label="Delete session" className="grid size-8 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-300">
            <Trash2 className="size-4" />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default PlanList;
