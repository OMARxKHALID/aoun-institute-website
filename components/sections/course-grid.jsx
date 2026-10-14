"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import CourseCard from "@/components/ui/course-card";

const CourseGrid = ({ courses }) => {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const categories = ["All", ...new Set(courses.map((c) => c.category).filter(Boolean))];
  const needle = query.trim().toLowerCase();
  const shown = courses.filter(
    (c) => (active === "All" || c.category === active) && (!needle || [c.title, c.subtitle, c.category, c.level].some((v) => v?.toLowerCase().includes(needle))),
  );

  const handleSelect = (c) => () => setActive(c);

  if (!courses.length) return <p className="pb-24 text-center text-xl text-white/50">New courses are coming soon.</p>;

  return (
    <section className="mx-auto w-[90%] pb-24 lg:w-[85%]">
      <label className="relative mx-auto mb-6 block max-w-xl">
        <span className="sr-only">Search courses</span>
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, e.g. Python, design, Flutter"
          className="w-full rounded-full border border-[#302C2A] bg-[#0C0C0C] py-3.5 pl-13 pr-5 text-lg outline-hidden placeholder:text-white/30 focus:border-accent"
        />
      </label>
      {categories.length > 2 && (
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={handleSelect(c)}
              aria-pressed={active === c}
              className={`rounded-full border px-5 py-2 text-lg transition-colors ${active === c ? "border-accent bg-[#4B1E0E] text-white" : "border-[#302C2A] text-white/60 hover:text-white"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <CourseCard key={c.id} {...c} />
        ))}
      </div>
      {!shown.length && <p className="py-10 text-center text-lg text-white/50">No courses match “{query}”.</p>}
    </section>
  );
};

export default CourseGrid;
