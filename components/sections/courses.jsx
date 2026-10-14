import { Award, BookOpen, CalendarDays } from "lucide-react";
import { formatDuration, formatPrice } from "@/lib/format";
import SectionHeading from "@/components/ui/section-heading";
import GlowButton from "@/components/ui/glow-button";
import RollText from "@/components/ui/roll-text";
import Link from "next/link";

const CourseCard = ({ slug, title, subtitle, thumbnail, price, discountPrice, currency, estimatedDuration, lessons, light, index }) => {
  const meta = [
    { icon: CalendarDays, label: "Duration", value: estimatedDuration ? formatDuration(estimatedDuration) : "Self-paced" },
    { icon: BookOpen, label: "Lessons", value: lessons },
    { icon: Award, label: "Certified", value: "Yes" },
  ];
  const free = price === 0 || discountPrice === 0;
  return (
  <article
    style={{ top: `${8 + index * 2}rem` }}
    className={`sticky z-10 mx-auto mb-6 h-max w-[90%] overflow-hidden rounded-2xl p-6 lg:px-12 lg:py-14 ${
      light ? "border border-[#CACACA]/50 bg-white text-black" : "bg-[#E35927] text-white"
    }`}
  >
    <div className={`relative flex flex-col-reverse justify-between md:gap-7 lg:gap-32 ${index % 2 === 0 ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
      <div className="relative z-10 flex flex-1 flex-col justify-center pt-6 lg:w-1/2">
        <h3 className="font-machina text-3xl font-medium leading-tight md:mb-4 md:text-4xl lg:mb-2 lg:text-[3.5rem]">{title}</h3>
        <p className={`line-clamp-2 text-xl font-light tracking-wide md:text-2xl lg:max-w-2xl ${light ? "text-black/60" : "text-white/60"}`}>{subtitle}</p>
        <div className="mt-4 flex w-full flex-wrap gap-5 md:mt-10 md:gap-10 lg:mt-8 lg:w-[60%] lg:justify-between">
          {meta.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="rounded-xl bg-[#FDEFEA] p-3 text-accent">
                <Icon className="size-6" />
              </span>
              <div>
                <p className="text-lg font-semibold">{value}</p>
                <p className="text-sm opacity-70">{label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          {!light && (
            <p className="my-6 text-3xl font-medium md:my-8 md:text-5xl lg:my-6">
              Price <span className="text-black">{free ? "Free" : formatPrice(discountPrice ?? price, currency)}</span>
              {!free && discountPrice != null && <span className="ml-2 text-xl line-through">{formatPrice(price, currency)}</span>}
            </p>
          )}
          <Link
            href={`/courses/${slug}`}
            className={`group flex w-fit rounded-2xl px-8 py-3 text-xl font-medium transition-colors ${light ? "bg-black text-white hover:bg-zinc-800" : "bg-white text-black hover:bg-gray-100"}`}
          >
            <RollText>Check Course →</RollText>
          </Link>
        </div>
      </div>
      <div className="relative h-[25vh] shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#f97316,#7c2d12_55%,#1c1917)] md:h-[35vh] lg:h-[55vh] lg:w-[40%]">
        {thumbnail?.url && <img src={thumbnail.url} alt="" className="size-full object-cover" />}
      </div>
    </div>
  </article>
  );
};

const Courses = ({ courses }) => (
  <section id="courses" className="relative flex flex-col items-center rounded-3xl bg-[#FFF3EF] pb-24 pt-20 text-black md:pt-44">
    <SectionHeading light tag="Courses" title="Not sure where to start? Pick the program that fits your goal" />
    <GlowButton href="/courses" className="mb-10">Explore Courses</GlowButton>
    <div className="relative w-full">
      {courses.slice(0, 4).map((course, i) => (
        <CourseCard key={course.id} {...course} light={i % 2 === 0} index={i} />
      ))}
    </div>
  </section>
);

export default Courses;
