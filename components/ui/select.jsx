"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { menuItem, menuPanel } from "@/lib/ui";

const toOption = (o) => (typeof o === "object" && o !== null ? { value: String(o.value), label: o.label } : { value: String(o), label: String(o).charAt(0).toUpperCase() + String(o).slice(1) });

const Select = ({ options = [], placeholder, className = "", wrapperClassName = "", ref, id, disabled, ...props }) => {
  const listId = useId();
  const selectRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const [current, setCurrent] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const items = options.map(toOption);
  const selected = items.find((o) => o.value === current);

  const setRefs = useCallback(
    (node) => {
      selectRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    const node = selectRef.current;
    if (!node) return;
    setCurrent(node.value);
    const handleChange = () => setCurrent(node.value);
    node.addEventListener("change", handleChange);
    return () => node.removeEventListener("change", handleChange);
  });

  const choose = (value) => {
    const node = selectRef.current;
    listRef.current?.hidePopover();
    buttonRef.current?.focus();
    if (!node || node.value === value) return;
    node.value = value;
    setCurrent(value);
    node.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const handleOpen = () => {
    const rect = buttonRef.current.getBoundingClientRect();
    const height = Math.min(288, items.length * 42 + 12);
    const below = rect.bottom + 6 + height <= window.innerHeight;
    setPos({ top: below ? rect.bottom + 6 : Math.max(8, rect.top - 6 - height), left: rect.left, width: rect.width });
    setActive(Math.max(0, items.findIndex((o) => o.value === current)));
  };

  const handleToggle = (e) => {
    if (e.newState === "open") requestAnimationFrame(() => listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const next = (active + delta + items.length) % items.length;
      setActive(next);
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (items[active]) choose(items[active].value);
    }
    if (e.key === "Tab") listRef.current?.hidePopover();
  };

  const handleButtonKey = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    handleOpen();
    listRef.current?.showPopover();
    listRef.current?.focus();
  };

  return (
    <div className={`relative ${wrapperClassName}`}>
      <select ref={setRefs} tabIndex={-1} aria-hidden="true" disabled={disabled} className="pointer-events-none absolute inset-0 opacity-0" {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {items.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        popoverTarget={listId}
        onClick={handleOpen}
        onKeyDown={handleButtonKey}
        aria-haspopup="listbox"
        aria-invalid={props["aria-invalid"]}
        aria-describedby={props["aria-describedby"]}
        aria-label={props["aria-label"]}
        className={`relative flex w-full items-center pr-10 text-left disabled:opacity-50 ${className}`}
      >
        <span className={`block truncate ${selected ? "" : "text-white/50"}`}>{selected?.label ?? placeholder ?? "Select…"}</span>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-white/50" />
      </button>
      <ul
        ref={listRef}
        id={listId}
        popover="auto"
        role="listbox"
        tabIndex={-1}
        onToggle={handleToggle}
        onKeyDown={handleKeyDown}
        aria-label={props["aria-label"] ?? placeholder}
        style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
        className={`${menuPanel} max-h-72 overflow-y-auto`}
      >
        {items.map(({ value, label }, index) => {
          const isSelected = value === current;
          return (
            <li
              key={value}
              role="option"
              aria-selected={isSelected}
              onClick={() => choose(value)}
              onMouseEnter={() => setActive(index)}
              className={`${menuItem} ${index === active ? "bg-white/[0.06]" : ""} ${isSelected ? "text-accent" : "text-white"}`}
            >
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {isSelected && <Check className="size-4 shrink-0" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Select;
