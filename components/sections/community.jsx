import { MoveUpRight, Play } from "lucide-react";
import SectionHeading from "@/components/ui/section-heading";
import GlowButton from "@/components/ui/glow-button";

const areas = [
  "col-start-1 col-span-5 row-start-1 row-span-8",
  "col-start-6 col-span-8 row-start-1 row-span-4",
  "col-start-14 col-span-5 row-start-1 row-span-4",
  "col-start-6 col-span-4 row-start-5 row-span-8",
  "col-start-10 col-span-9 row-start-5 row-span-4",
  "col-start-1 col-span-5 row-start-9 row-span-4",
  "col-start-10 col-span-4 row-start-9 row-span-4",
  "col-start-14 col-span-5 row-start-9 row-span-4",
];

const tones = ["from-orange-400 to-stone-700", "from-stone-400 to-stone-700", "from-amber-300 to-orange-700", "from-rose-300 to-stone-700", "from-orange-300 to-stone-600", "from-stone-300 to-orange-800", "from-amber-200 to-stone-700", "from-orange-500 to-stone-800"];

const Tile = ({ title, text, image, area, tone, video }) => (
  <div className={`group relative overflow-hidden rounded-xl bg-black/10 text-white max-sm:h-[50vh] ${area}`}>
    <div className={`absolute inset-0 bg-linear-to-br ${tone} transition-all duration-300 group-hover:grayscale`}>
      {image?.url && <img src={image.url} alt="" className="size-full object-cover" />}
    </div>
    {video ? (
      <span className="absolute inset-0 grid place-items-center bg-black/20">
        <span className="grid size-16 place-items-center rounded-full bg-white/90">
          <Play className="size-7 fill-black text-black" />
        </span>
      </span>
    ) : (
      <>
        <div className="absolute bottom-0 left-0 z-20 hidden min-h-[30%] w-full translate-y-full bg-linear-to-b from-transparent to-accent pt-10 transition-all duration-500 group-hover:translate-y-0 lg:flex">
          <div className="mt-auto h-max p-8 pt-10">
            <h3 className="font-machina text-3xl font-bold capitalize">{title}</h3>
            <p className="text-lg text-white">{text}</p>
          </div>
        </div>
        <span className="absolute right-5 top-5 grid place-items-center rounded-full bg-[#010101] p-[1em] backdrop-blur-md transition-all duration-700 group-hover:rotate-45">
          <MoveUpRight className="size-6 lg:size-[2em]" />
        </span>
      </>
    )}
  </div>
);

const Community = ({ communityTiles }) => (
  <section className="flex w-full flex-col items-center justify-center rounded-4xl bg-[#FFF3EF] py-20 text-black sm:px-6">
    <SectionHeading light tag="Community" title="They came. They built. They got hired." />
    <GlowButton href="/courses" className="mb-10 sm:mb-20">Explore Courses</GlowButton>
    <div className="flex w-full flex-col gap-6 px-10 sm:hidden">
      {communityTiles.slice(0, 3).map((t, i) => (
        <Tile key={t.title} {...t} area="" tone={tones[i]} video={i === 0} />
      ))}
    </div>
    <div className="mx-auto grid h-[70vh] w-full grid-cols-18 grid-rows-12 gap-3 px-4 max-sm:hidden sm:gap-4 md:gap-6 md:px-6 lg:h-[115vh] lg:px-20">
      {communityTiles.map((t, i) => (
        <Tile key={t.title} {...t} area={areas[i]} tone={tones[i]} video={i === 0} />
      ))}
    </div>
  </section>
);

export default Community;
