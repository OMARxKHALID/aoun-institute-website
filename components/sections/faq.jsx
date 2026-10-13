"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SectionHeading from "@/components/ui/section-heading";

const FaqItem = ({ q, a, open, onToggle }) => (
  <div className="relative overflow-hidden rounded-2xl border-[.7px] border-[#2A2D30] bg-[#000205] max-md:pb-5 md:w-5xl">
    <button onClick={onToggle} aria-expanded={open} className="flex w-full cursor-pointer items-center justify-between gap-5 p-4 text-left md:p-6">
      <span className="text-2xl font-normal text-[#E9E9E9]/90 max-md:text-[1.3rem]">{q}</span>
      <ChevronDown className={`size-9 shrink-0 transition-all duration-300 ease-in-out ${open ? "rotate-180 text-accent" : "text-white"}`} />
    </button>
    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
      <div className="overflow-hidden">
        <p className="px-4 pb-4 text-lg font-light text-white/60 max-md:text-[1.063rem] md:px-6 md:pb-6">{a}</p>
      </div>
    </div>
  </div>
);

const Faq = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (i) => () => setOpenIndex((cur) => (cur === i ? -1 : i));

  return (
    <section className="relative isolate flex w-full flex-col items-center justify-center gap-10 overflow-hidden bg-black px-18 pb-20 max-md:px-8">
      <div className="pointer-events-none absolute bottom-[5%] left-1/2 -z-10 h-[400px] w-[60%] -translate-x-1/2 rounded-full bg-accent opacity-10 blur-3xl" />
      <SectionHeading tag="FAQs" title="Frequently asked questions from our learners" />
      <div className="flex flex-col gap-6 max-md:w-full md:gap-4">
        {faqs.map((f, i) => (
          <FaqItem key={f.q} {...f} open={openIndex === i} onToggle={handleToggle(i)} />
        ))}
      </div>
    </section>
  );
};

export default Faq;
