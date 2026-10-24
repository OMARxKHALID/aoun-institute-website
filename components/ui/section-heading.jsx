import SectionTag from "@/components/ui/section-tag";
import Reveal from "@/components/motion/reveal";

const SectionHeading = ({ tag, title, light }) => (
  <Reveal className="flex w-full flex-col items-center text-center">
    <SectionTag light={light}>{tag}</SectionTag>
    <div className="flex w-full justify-center px-5">
      <p className="mb-5 mt-5 w-[90%] shrink-0 text-[2.2rem] font-medium capitalize leading-[1.3] sm:mb-9 md:w-[95%] md:text-[3.5rem] md:leading-18 lg:w-[75%]">
        {title}
      </p>
    </div>
  </Reveal>
);

export default SectionHeading;
