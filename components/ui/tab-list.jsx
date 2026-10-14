"use client";

const TabList = ({ tabs, value, onChange, label, size = "md" }) => (
  <div role="tablist" aria-label={label} className="flex gap-2 overflow-x-auto pb-1">
    {tabs.map((tab) => {
      const id = typeof tab === "string" ? tab : tab.value;
      const text = typeof tab === "string" ? tab : tab.label;
      const active = value === id;
      return (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(id)}
          className={`shrink-0 rounded-full border transition ${size === "sm" ? "px-3.5 py-1.5 text-sm" : "px-4 py-2"} ${
            active ? "border-accent bg-[#4B1E0E] text-white" : "border-[#302C2A] text-white/60 hover:border-white/30 hover:text-white"
          }`}
        >
          {text}
        </button>
      );
    })}
  </div>
);

export default TabList;
