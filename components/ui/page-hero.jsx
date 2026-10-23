import SectionTag from "@/components/ui/section-tag";
import HeroBackground from "@/components/ui/hero-background";
import Reveal from "@/components/motion/reveal";

const PageHero = ({ tag, title, text, children }) => (
  <section className="relative isolate flex flex-col items-center px-18 pb-16 pt-44 text-center max-md:px-8 max-md:pt-36">
    <HeroBackground className="h-[70vh]" />
    <Reveal className="flex flex-col items-center gap-6">
      <SectionTag>{tag}</SectionTag>
      <h1 className="w-[90%] font-machina text-[2.5rem] font-normal capitalize leading-tight tracking-tight md:text-[4rem] lg:w-[70%]">{title}</h1>
      {text && <p className="w-[90%] text-xl font-normal text-white/70 md:text-[1.6rem] lg:w-[60%]">{text}</p>}
      {children}
    </Reveal>
  </section>
);

export default PageHero;
