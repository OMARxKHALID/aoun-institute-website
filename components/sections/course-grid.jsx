"use client";

import { useState } from "react";
import CourseCard from "@/components/ui/course-card";

const CourseGrid = ({ courses }) => {
  const [active, setActive] = useState("All");
  const categories = ["All", ...new Set(courses.map((c) => c.category).filter(Boolean))];
  const shown = active === "All" ? courses : courses.filter((c) => c.category === active);

  const handleSelect = (c) => () => setActive(c);

  if (!courses.length) return <p className="pb-24 text-center text-xl text-white/50">New courses are coming soon.</p>;

  return (
    <section className="mx-auto w-[90%] pb-24 lg:w-[85%]">
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
    </section>
  );
};

export default CourseGrid;
