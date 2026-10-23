import CornerDots from "@/components/ui/corner-dots";

const SectionTag = ({ children, light }) => (
  <h2
    className={`relative mx-auto inline-block w-fit border bg-[#e8602e21] px-4 pt-1.5 font-machina text-xl font-normal uppercase leading-none md:text-2xl ${
      light ? "border-[0.5px] border-accent text-black/90" : "border-[#3a1a0e] text-white/70"
    }`}
  >
    {children}
    <CornerDots className={`size-[3px] ${light ? "bg-black/60" : "bg-white"}`} />
  </h2>
);

export default SectionTag;
