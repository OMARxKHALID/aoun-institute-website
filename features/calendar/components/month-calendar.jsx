import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MonthCalendar = ({ month, prev, next, today, plans, studied, basePath }) => {
  const [y, m] = month.split("-").map(Number);
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const byDay = Map.groupBy(plans, (p) => p.day);
  const minutes = new Map(studied.map((s) => [s.day, s.minutes]));
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const key = (d) => `${month}-${String(d).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-machina text-xl">{label}</p>
        <div className="flex gap-2">
          <Link href={`${basePath}?m=${prev}`} aria-label="Previous month" className="grid size-9 place-items-center rounded-full border border-[#302C2A] hover:border-accent">
            <ChevronLeft className="size-4" />
          </Link>
          <Link href={`${basePath}?m=${next}`} aria-label="Next month" className="grid size-9 place-items-center rounded-full border border-[#302C2A] hover:border-accent">
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 text-center text-xs text-white/50">
            <span className="sm:hidden">{d[0]}</span>
            <span className="hidden sm:inline">{d}</span>
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const k = key(day);
          const items = byDay.get(k) ?? [];
          const studiedMin = minutes.get(k);
          return (
            <div
              key={i}
              className={`flex min-h-12 flex-col gap-1 rounded-xl border p-1.5 sm:min-h-24 sm:p-2 ${k === today ? "border-accent bg-accent/[0.08]" : "border-white/5 bg-[#070707]"}`}
            >
              <span className={`text-xs ${k === today ? "font-semibold text-accent" : "text-white/70"}`}>{day}</span>
              {studiedMin > 0 && (
                <span title={`${studiedMin} minutes studied`} className="hidden truncate rounded-md bg-green-500/10 px-1.5 py-0.5 text-xs text-green-400 sm:block">
                  {studiedMin} min studied
                </span>
              )}
              {items.slice(0, 2).map((p) => (
                <span key={p.id} title={`${p.time} ${p.title}`} className={`hidden truncate rounded-md px-1.5 py-0.5 text-xs sm:block ${p.done ? "bg-white/5 text-white/50 line-through" : "bg-accent/15 text-accent"}`}>
                  {p.time} {p.title}
                </span>
              ))}
              <span className="flex gap-1 sm:hidden">
                {studiedMin > 0 && <span className="size-1.5 rounded-full bg-green-400" />}
                {items.length > 0 && <span className="size-1.5 rounded-full bg-accent" />}
              </span>
              {items.length > 2 && <span className="hidden text-xs text-white/50 sm:block">+{items.length - 2} more</span>}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent" /> Planned session
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-green-400" /> Studied
        </span>
      </div>
    </div>
  );
};

export default MonthCalendar;
