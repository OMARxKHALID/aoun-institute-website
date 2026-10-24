"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { menuPanel } from "@/lib/ui";

const pad = (n) => String(n).padStart(2, "0");

const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const fromKey = (key) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key ?? "")) return null;
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const label = (key) => fromKey(key)?.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const monthCells = (view) => {
  const year = view.getFullYear();
  const month = view.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => new Date(year, month, i - offset + 1));
};

const DateInput = ({ placeholder = "Pick a date", className = "", ref, id, disabled, min, max, ...props }) => {
  const panelId = useId();
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const gridRef = useRef(null);
  const [current, setCurrent] = useState("");
  const [view, setView] = useState(() => new Date());
  const [focus, setFocus] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const today = toKey(new Date());

  const setRefs = useCallback(
    (node) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    const node = inputRef.current;
    if (!node) return;
    setCurrent(node.value);
    const handleChange = () => setCurrent(node.value);
    node.addEventListener("change", handleChange);
    return () => node.removeEventListener("change", handleChange);
  });

  useEffect(() => {
    if (!focus) return;
    gridRef.current?.querySelector(`[data-day="${focus}"]`)?.focus();
  }, [focus, view]);

  const allowed = (key) => (!min || key >= min) && (!max || key <= max);

  const commit = (value) => {
    const node = inputRef.current;
    panelRef.current?.hidePopover();
    buttonRef.current?.focus();
    if (!node || node.value === value) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(node, value);
    setCurrent(value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const handleOpen = () => {
    const rect = buttonRef.current.getBoundingClientRect();
    const height = 372;
    const width = 296;
    const below = rect.bottom + 6 + height <= window.innerHeight;
    setPos({ top: below ? rect.bottom + 6 : Math.max(8, rect.top - 6 - height), left: Math.min(rect.left, window.innerWidth - width - 8) });
    const start = fromKey(current) ?? fromKey(min && today < min ? min : today);
    setView(new Date(start.getFullYear(), start.getMonth(), 1));
    setFocus("");
  };

  const handleToggle = (e) => {
    if (e.newState !== "open") return;
    setFocus(current || (min && today < min ? min : today));
  };

  const shiftMonth = (delta) => setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  const handleGridKey = (e) => {
    const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const date = fromKey(focus);
      const next = e.key === "Home" ? new Date(date.getFullYear(), date.getMonth(), 1) : new Date(date.getFullYear(), date.getMonth() + 1, 0);
      setFocus(toKey(next));
      return;
    }
    if (!(e.key in steps)) return;
    e.preventDefault();
    const date = fromKey(focus);
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + steps[e.key]);
    if (next.getMonth() !== view.getMonth() || next.getFullYear() !== view.getFullYear()) setView(new Date(next.getFullYear(), next.getMonth(), 1));
    setFocus(toKey(next));
  };

  return (
    <div className="relative">
      <input ref={setRefs} type="date" tabIndex={-1} aria-hidden="true" disabled={disabled} min={min} max={max} className="pointer-events-none absolute inset-0 opacity-0" {...props} />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        popoverTarget={panelId}
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-invalid={props["aria-invalid"]}
        aria-describedby={props["aria-describedby"]}
        className={`relative flex w-full items-center pr-12 text-left disabled:opacity-50 ${className}`}
      >
        <span className={`block truncate ${current ? "" : "text-white/50"}`}>{label(current) ?? placeholder}</span>
        <CalendarDays aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-accent" />
      </button>
      <div
        ref={panelRef}
        id={panelId}
        popover="auto"
        role="dialog"
        aria-label="Choose a date"
        onToggle={handleToggle}
        style={{ top: pos.top, left: pos.left }}
        className={`${menuPanel} w-74 p-3`}
      >
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <p className="font-medium">{view.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
          <div className="flex gap-1">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className="grid size-8 place-items-center rounded-lg text-white/70 transition hover:bg-white/[0.06] hover:text-white">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className="grid size-8 place-items-center rounded-lg text-white/70 transition hover:bg-white/[0.06] hover:text-white">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
        <div ref={gridRef} role="grid" onKeyDown={handleGridKey} className="grid grid-cols-7 gap-1 text-center text-sm">
          {weekdays.map((d) => (
            <span key={d} className="py-1 text-xs text-white/50">
              {d}
            </span>
          ))}
          {monthCells(view).map((date) => {
            const key = toKey(date);
            const outside = date.getMonth() !== view.getMonth();
            const isSelected = key === current;
            const isToday = key === today;
            const ok = allowed(key);
            return (
              <button
                key={key}
                type="button"
                data-day={key}
                tabIndex={key === focus ? 0 : -1}
                disabled={!ok}
                onClick={() => commit(key)}
                aria-pressed={isSelected}
                aria-label={label(key)}
                className={`grid aspect-square place-items-center rounded-lg outline-hidden transition focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-25 ${
                  isSelected ? "bg-linear-to-b from-[#E8602E] to-[#A8401A] font-semibold text-white" : isToday ? "border border-accent/60 text-accent hover:bg-accent/10" : outside ? "text-white/30 hover:bg-white/[0.06]" : "text-white/80 hover:bg-white/[0.06]"
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/5 px-1 pt-3 text-sm">
          <button type="button" onClick={() => commit("")} className="rounded-lg px-2 py-1 text-white/60 transition hover:bg-white/[0.06] hover:text-white">
            Clear
          </button>
          <button type="button" disabled={!allowed(today)} onClick={() => commit(today)} className="rounded-lg px-2 py-1 font-medium text-accent transition hover:bg-accent/10 disabled:opacity-30">
            Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateInput;
