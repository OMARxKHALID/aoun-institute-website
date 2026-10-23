import CornerDots from "@/components/ui/corner-dots";
import GlowButton from "@/components/ui/glow-button";

const floaters = [
  "left-[8%] top-[15%] w-40 rotate-[-8deg]",
  "left-[22%] top-[60%] w-32 rotate-[6deg]",
  "right-[10%] top-[12%] w-44 rotate-[7deg]",
  "right-[24%] top-[65%] w-36 rotate-[-5deg]",
  "left-[45%] top-[6%] w-28 rotate-[3deg]",
];

const titleClass = "w-[90%] text-center font-machina text-[2.7rem] font-normal capitalize tracking-tight max-sm:leading-[3.4rem] md:text-[5rem] md:leading-20 lg:w-[70%] lg:text-[4.7rem]";

const Cta = ({ brand }) => (
  <section className="relative isolate mb-20 flex flex-col items-center justify-center overflow-hidden py-44 text-center lg:h-screen">
    <div className="pointer-events-none absolute inset-0 -z-10">
      {floaters.map((f) => (
        <span key={f} className={`absolute aspect-video rounded-lg bg-linear-to-br from-stone-500 to-stone-900 opacity-40 blur-[2px] ${f}`} />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.85)_30%,transparent_80%)]" />
    </div>
    <h2 className={titleClass}>Turn your learning journey into a career breakthrough with</h2>
    <div className={`mt-2 ${titleClass}`}>
      <span className="relative mx-auto inline-block w-fit border-[.5px] border-[#E8602E]/20 bg-[#e8602e21] px-[.5rem] pb-[0.25rem] pt-[.5rem] font-normal leading-none text-[#fadfd5]">
        {brand.shortName || brand.name}
        <CornerDots className="w-1.5 bg-white" />
      </span>
    </div>
    <GlowButton href="/courses" className="mb-10 mt-16 sm:mb-20">Explore Courses</GlowButton>
  </section>
);

export default Cta;
