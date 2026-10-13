"use client";

import { useState } from "react";
import { courses } from "@/lib/data";
import CourseCard from "@/components/ui/course-card";

const categories = ["All", ...new Set(courses.map((c) => c.category))];

const CourseGrid = () => {
  const [active, setActive] = useState("All");

  const handleSelect = (c) => () => setActive(c);

  const shown = active === "All" ? courses : courses.filter((c) => c.category === active);

  return (
    <section className="mx-auto w-[90%] pb-24 lg:w-[85%]">
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {categories.map((c) => (
          <button
            key={c}
            onClick={handleSelect(c)}
            className={`rounded-full border px-5 py-2 text-lg transition-colors ${
              active === c ? "border-accent bg-[#4B1E0E] text-white" : "border-[#302C2A] text-white/60 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <CourseCard key={c.slug} {...c} />
        ))}
      </div>
    </section>
  );
};

export default CourseGrid;
