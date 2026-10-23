import { Star } from "lucide-react";
import SectionHeading from "@/components/ui/section-heading";
import Marquee from "@/components/motion/marquee";

const TestimonialCard = ({ name, role, rating, quote }) => (
  <div className="z-10 mr-8 h-[30ch] w-[80vw] shrink-0 overflow-hidden rounded-2xl bg-linear-to-b from-[#666666] to-black to-20% p-[.5px] md:mr-14 md:w-[45vw] md:to-80% lg:w-[30vw]">
    <div className="relative flex h-full w-full flex-col gap-4 overflow-hidden rounded-2xl bg-black px-8 py-8 text-white/70 md:min-h-[15.4rem]">
      <div className="mb-4 flex items-center gap-5 border-b border-white/20 pb-4 md:pb-6">
        <span className="grid size-[5em] shrink-0 place-items-center rounded-full bg-linear-to-br from-accent to-stone-800 text-2xl font-semibold text-white">
          {name[0]}
        </span>
        <div>
          <p className="text-xl font-medium text-white">{name}</p>
          <p className="text-white/50">{role}</p>
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2 text-lg text-white/50">
          {rating}
          <span className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="size-4 fill-amber-300 text-amber-300" />
            ))}
          </span>
        </div>
        <p className="line-clamp-2 text-xl font-normal capitalize">{quote}</p>
      </div>
    </div>
  </div>
);

const Testimonials = ({ testimonials }) => {
  const half = Math.ceil(testimonials.length / 2);
  return (
  <section className="flex w-full flex-col items-center justify-around gap-10 overflow-hidden bg-black py-10">
    <SectionHeading tag="Hear from our Learners" title="We help learners become industry-ready developers" />
    <div className="relative h-full w-full md:mt-10">
      <div className="pointer-events-none absolute left-0 top-0 z-20 h-full bg-linear-to-r from-black to-transparent to-95% md:w-[30vw]" />
      <Marquee pauseOnHover className="px-4 md:px-2.5">
        {testimonials.slice(0, half).map((t) => (
          <TestimonialCard key={t.name} {...t} />
        ))}
      </Marquee>
      <div className="mt-8 md:mt-12">
        <Marquee reverse pauseOnHover className="px-4 md:px-2.5">
          {testimonials.slice(half).map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </Marquee>
      </div>
      <div className="pointer-events-none absolute right-0 top-0 z-20 h-full bg-linear-to-l from-black to-transparent to-95% md:w-[30vw]" />
    </div>
  </section>
  );
};

export default Testimonials;
