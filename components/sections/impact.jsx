"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, CirclePlay, ListChecks, MoveUpRight, Sparkles, TrendingUp } from "lucide-react";
import SectionHeading from "@/components/ui/section-heading";
import { imageUrl } from "@/lib/upload-rules";

gsap.registerPlugin(ScrollTrigger);

const tones = ["from-orange-700 via-stone-800 to-stone-950", "from-amber-600 via-stone-800 to-stone-950", "from-rose-700 via-stone-800 to-stone-950", "from-orange-500 via-stone-800 to-stone-950"];

const icons = [CirclePlay, ListChecks, TrendingUp, Award];

const ImpactCard = ({ title, text, tag, image, tone, offset, Icon }) => (
  <article
    data-impact-card
    className={`group relative aspect-7/9 w-[95%] shrink-0 snap-center overflow-hidden rounded-xl sm:w-[40%] lg:w-[25%] ${offset ? "sm:mt-20" : ""}`}
  >
    <div className={`absolute inset-0 bg-linear-to-b ${tone} transition-all duration-300 ${image?.url ? "max-md:grayscale md:group-hover:grayscale" : ""}`}>
      {image?.url ? (
        <img src={imageUrl(image.url, 800)} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
      ) : (
        <div className="grid size-full place-items-center pb-[30%]">
          <span className="grid size-32 place-items-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
            <Icon className="size-14 text-white/90" strokeWidth={1.25} />
          </span>
        </div>
      )}
    </div>
    <div className={`absolute left-0 top-0 z-20 p-5 transition-all duration-500 ${image?.url ? "md:opacity-0 md:group-hover:opacity-100" : ""}`}>
      <span className="flex items-center gap-2 rounded-full border border-white/20 bg-linear-to-r from-[#FF6900] to-[#F54900] px-4 py-2 font-medium">
        {tag}
        <Sparkles className="size-4" />
      </span>
    </div>
    <div className={`absolute bottom-0 left-0 z-20 flex min-h-[50%] w-full bg-linear-to-b from-transparent to-accent pt-10 transition-all duration-500 group-hover:translate-y-0 ${image?.url ? "md:translate-y-full" : ""}`}>
      <div className="mt-auto h-max p-8 pt-10">
        <h3 className="text-2xl font-medium max-md:mb-2 md:text-3xl">{title}</h3>
        <p className="text-white">{text}</p>
      </div>
    </div>
    <span className="absolute right-5 top-5 z-20 rounded-full border border-white/40 bg-[#010101] p-[1em] backdrop-blur-md transition-all duration-300 ease-out group-hover:rotate-45 md:p-4">
      <MoveUpRight className="size-[2em] md:size-8" />
    </span>
  </article>
);

const cardsOf = (track) => [...track.querySelectorAll("[data-impact-card]")];

const Impact = ({ impactCards }) => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const frameRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const track = trackRef.current;
      const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top 40%", end: "bottom 30%", scrub: 0.6, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, []);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const handleScroll = () => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const track = trackRef.current;
      if (!track) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      const distances = cardsOf(track).map((card) => Math.abs(card.offsetLeft + card.offsetWidth / 2 - center));
      setActive(distances.indexOf(Math.min(...distances)));
    });
  };

  const handleDotClick = (index) => {
    const track = trackRef.current;
    const card = cardsOf(track)[index];
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="flex w-full flex-col items-center overflow-hidden bg-black py-10 lg:py-24">
      <SectionHeading tag="Impact" title="How we help learners move faster and further" />
      <div ref={trackRef} onScroll={handleScroll} className="flex w-full snap-x snap-mandatory items-start gap-8 overflow-x-auto px-6 [scrollbar-width:none] lg:overflow-visible">
        <div className="w-[40%] shrink-0 max-md:hidden sm:w-[25%]" />
        {impactCards.map((card, i) => (
          <ImpactCard key={card.title} {...card} tone={tones[i % tones.length]} Icon={icons[i % icons.length]} offset={i % 2 === 1} />
        ))}
        <div className="shrink-0 max-md:hidden sm:w-10 lg:w-[5vw]" />
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 lg:hidden">
        {impactCards.map((card, i) => (
          <button
            key={card.title}
            type="button"
            aria-label={`Show ${card.title}`}
            aria-current={active === i}
            onClick={() => handleDotClick(i)}
            className={`h-2 rounded-full transition-all duration-300 ${active === i ? "w-6 bg-accent" : "w-2 bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Impact;
