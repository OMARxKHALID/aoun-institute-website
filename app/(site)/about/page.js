import { aboutStats, brand, mentors, milestones, values } from "@/lib/data";
import PageHero from "@/components/ui/page-hero";
import SectionHeading from "@/components/ui/section-heading";
import GlowButton from "@/components/ui/glow-button";
import Reveal from "@/components/motion/reveal";

export const metadata = { title: "About Us", description: "Meet the institute behind our project-based courses: who we are, how we teach and why our students get hired.", alternates: { canonical: "/about" } };

const AboutPage = () => (
  <main>
    <PageHero
      tag="About"
      title={`We are ${brand.name}`}
      text="A learning community built by engineers who believe the fastest way to get hired is to build real things with honest feedback."
    />

    <section className="mx-auto grid w-[90%] grid-cols-2 gap-6 pb-24 lg:w-[80%] lg:grid-cols-4">
      {aboutStats.map(({ value, label }, i) => (
        <Reveal key={label} delay={i * 0.08} className="rounded-2xl border border-[#302C2A] p-6">
          <p className="font-machina text-5xl tracking-tighter text-accent">{value}</p>
          <p className="mt-2 text-xl font-light text-white/70">{label}</p>
        </Reveal>
      ))}
    </section>

    <section className="mx-2 rounded-4xl bg-[#FFF3EF] px-6 py-20 text-black sm:mx-4">
      <SectionHeading light tag="Our Story" title="From a weekend club to a career launchpad" />
      <div className="mx-auto mt-6 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {milestones.map(({ year, text }, i) => (
          <Reveal key={year} delay={i * 0.08} className="rounded-2xl bg-white p-6">
            <p className="font-machina text-4xl text-accent">{year}</p>
            <p className="mt-3 text-lg text-black/70">{text}</p>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="px-8 py-24">
      <SectionHeading tag="Values" title="What we stand for" />
      <div className="mx-auto mt-6 grid max-w-6xl gap-6 md:grid-cols-2">
        {values.map(({ title, text }, i) => (
          <Reveal key={title} delay={i * 0.08} className="rounded-2xl bg-linear-to-b from-[#666666] to-black to-60% p-[.5px]">
            <div className="h-full rounded-2xl bg-black p-8">
              <h3 className="font-machina text-3xl">{title}</h3>
              <p className="mt-3 text-xl font-light text-white/60">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="px-8 pb-24">
      <SectionHeading tag="Mentors" title="Learn from people who ship" />
      <div className="mx-auto mt-6 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mentors.map(({ name, role, focus }, i) => (
          <Reveal key={name} delay={i * 0.08} className="group overflow-hidden rounded-2xl border border-[#302C2A]">
            <div className="grid aspect-square place-items-center bg-linear-to-br from-accent to-stone-900 font-machina text-6xl transition-all duration-500 group-hover:grayscale">
              {name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="p-5">
              <p className="text-xl font-medium">{name}</p>
              <p className="text-accent">{role}</p>
              <p className="mt-1 text-white/50">{focus}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-16 flex justify-center">
        <GlowButton href="/courses">Explore Courses</GlowButton>
      </div>
    </section>
  </main>
);

export default AboutPage;
