import Link from "next/link";
import { Award, MoveRight, Users } from "lucide-react";
import CornerDots from "@/components/ui/corner-dots";
import GlowButton from "@/components/ui/glow-button";
import AvatarStack from "@/components/ui/avatar-stack";
import HeroBackground from "@/components/ui/hero-background";

const StatCard = ({ icon, value, label, text }) => (
  <div className="flex flex-col justify-between rounded-2xl border-[0.54px] border-[#302C2A] p-5">
    <div>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-6xl tracking-tighter text-accent lg:text-5xl">{value}</p>
      </div>
      <p className="mt-1.5 text-2xl font-light lg:text-xl">{label}</p>
    </div>
    <p className="mt-auto text-2xl leading-snug max-sm:pt-10 lg:text-xl">{text}</p>
  </div>
);

const statIcons = [Users, Award].map((Icon) => (
  <span key={Icon.displayName ?? Icon.name} className="grid size-11 place-items-center rounded-xl bg-accent/15 text-accent">
    <Icon className="size-6" />
  </span>
));

const liveCards = (live) => [
  { value: live.students.toLocaleString("en-US"), label: "Students Enrolled", text: "Learning with us right now, from around the world." },
  { value: live.graduates.toLocaleString("en-US"), label: "Graduates", text: "Finished a course and earned a verifiable certificate." },
];

const Hero = ({ hero, stats: fallback, live }) => {
  const stats = live?.students ? liveCards(live) : fallback;
  return (

  <section className="mt-50 flex w-full flex-col items-center justify-center gap-3 overflow-hidden px-18 max-md:mt-36 max-md:px-8 md:gap-6">
    <HeroBackground />
    <h4 className="mb-2 text-center uppercase text-accent md:text-2xl">{hero.eyebrow}</h4>
    <h1 className="w-[90%] text-center font-machina text-[2.7rem] font-normal capitalize tracking-tight max-sm:leading-[3.4rem] md:text-[5rem] md:leading-20 lg:w-[70%] lg:text-[4.7rem]">
      {hero.title}{" "}
      <span className="relative mx-auto inline-block w-fit border border-accent bg-[#E8602E21] px-2 pt-[.06rem] text-white">
        {hero.highlight}
        <CornerDots className="h-1 bg-white" />
      </span>{" "}
      {hero.titleEnd}
    </h1>
    <p className="w-[90%] text-center text-xl font-light text-[#D7D7D7] md:text-[1.9rem] lg:w-[65%]">
      {hero.subtitle}
    </p>
    <div className="flex flex-wrap items-center justify-center gap-2 text-center text-lg font-light text-white/70">
      <AvatarStack />
      <span className="font-bold text-accent">{stats[0]?.value}</span>
      learners building in our programs
    </div>
    <GlowButton href="/courses" className="mb-10 mt-5">Start Journey</GlowButton>

    <div className="mt-14 flex w-full flex-col gap-6 rounded-2xl border border-[#302C2A] p-7 lg:w-[80%] lg:flex-row">
      <div className="w-full gap-6 max-md:space-y-6 md:grid md:grid-cols-2 md:grid-rows-2 lg:w-1/2">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} icon={statIcons[i]} {...stat} />
        ))}
        <div className="col-span-2 flex flex-wrap items-center gap-5 rounded-2xl border-[0.54px] border-[#302C2A] px-5 py-7 text-4xl font-light uppercase max-sm:leading-tight sm:text-5xl lg:p-5 lg:text-6xl">
          Unlock
          <AvatarStack />
          your
          <span className="mr-2 flex h-10 items-center rounded-full border border-accent pl-18 pr-2">
            <MoveRight className="size-8" />
          </span>
          next skill with us!
        </div>
      </div>
      <div className="relative flex w-full overflow-hidden rounded-2xl border border-[#302C2A] bg-black max-sm:h-[40vh] lg:w-1/2">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#52525b,#18181b_55%,#7c2d12)] opacity-50" />
        <h3 className="absolute left-5 top-5 z-10 text-5xl font-light">
          Start
          <br />
          Learning
        </h3>
        <Link href="/contact" className="absolute bottom-5 left-5 z-10 rounded-xl border-[0.5px] border-white/40 px-7 py-4 text-2xl font-light text-accent backdrop-blur-3xl">
          Get in touch →
        </Link>
      </div>
    </div>
  </section>
  );
};

export default Hero;
