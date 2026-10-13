import { Play } from "lucide-react";
import { videos } from "@/lib/data";
import SectionHeading from "@/components/ui/section-heading";
import Marquee from "@/components/motion/marquee";

const VideoCard = ({ title, views, ago }) => (
  <article className="group mr-9 w-md shrink-0 overflow-hidden rounded-xl border border-[#4E4A48] p-7 transition-all duration-500 hover:border-accent md:w-2xl">
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[linear-gradient(135deg,#78350f,#1c1917_60%,#9a3412)]">
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60" />
      <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-red-600 transition-transform duration-300 group-hover:scale-110">
        <Play className="size-7 fill-white" />
      </span>
    </div>
    <div className="pt-4 font-light">
      <h3 className="mb-2 line-clamp-2 text-[21.64px] font-medium tracking-wide text-white">{title}</h3>
      <p className="flex items-center gap-2 text-[16.23px] text-white/60">
        {views} Views <span>•</span> {ago}
      </p>
    </div>
  </article>
);

const Youtube = () => (
  <section className="relative flex w-full flex-col items-center justify-center py-10">
    <SectionHeading tag="YouTube" title="200+ free coding tutorials to start learning today" />
    <div className="w-full py-10">
      <Marquee pauseOnHover className="py-2.5">
        {videos.map((v) => (
          <VideoCard key={v.title} {...v} />
        ))}
      </Marquee>
    </div>
  </section>
);

export default Youtube;
