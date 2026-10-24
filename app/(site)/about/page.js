import Link from "next/link";
import { values } from "@/lib/data";
import { getPublicTeachers } from "@/features/courses/queries";
import { imageUrl } from "@/lib/upload-rules";
import PageHero from "@/components/ui/page-hero";
import SectionHeading from "@/components/ui/section-heading";
import GlowButton from "@/components/ui/glow-button";
import Reveal from "@/components/motion/reveal";
import { getSiteSettings } from "@/features/site-settings/queries";
import { getPublicStats } from "@/features/analytics/public-stats";

export const metadata = { title: "About Us", description: "Meet the institute behind our recorded, project-based courses: who we are, how we teach and how you can prove what you learned.", alternates: { canonical: "/about" } };

const AboutPage = async () => {
  const [{ brand }, live, teachers] = await Promise.all([getSiteSettings(), getPublicStats(), getPublicTeachers()]);
  const stats = [
    { value: live.students, label: "Students learning" },
    { value: live.graduates, label: "Certificates issued" },
    { value: live.courses, label: "Courses published" },
    { value: live.countries.length, label: "Countries" },
  ].filter(({ value }) => value > 0);
  return (
    <main>
      <PageHero tag="About" title={`We are ${brand.name}`} text="A learning platform built on one idea: the fastest way to learn is to build real things and check your progress as you go." />

      {stats.length > 0 && (
        <section className="mx-auto grid w-[90%] grid-cols-2 gap-6 pb-24 lg:w-[80%] lg:grid-cols-4">
          {stats.map(({ value, label }, i) => (
            <Reveal key={label} delay={i * 0.08} className="rounded-2xl border border-[#302C2A] p-6">
              <p className="font-machina text-5xl tracking-tighter text-accent">{value.toLocaleString("en-US")}</p>
              <p className="mt-2 text-xl font-light text-[#D3D3D3]">{label}</p>
            </Reveal>
          ))}
        </section>
      )}

      {teachers.length > 0 && (
        <section className="mx-auto w-[90%] pb-12 lg:w-[85%]">
          <SectionHeading tag="Teachers" title="The people who teach our courses" />
          <div className="flex flex-wrap justify-center gap-6">
            {teachers.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.08} className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border border-[#302C2A] bg-linear-to-b from-[#1a0b06] to-black p-8 text-center">
                <span className="grid size-28 place-items-center overflow-hidden rounded-full border-2 border-accent/60 bg-accent/15 text-4xl font-semibold text-accent">
                  {t.image ? <img src={imageUrl(t.image, 256)} alt={t.name} loading="lazy" className="size-full object-cover" /> : t.name.charAt(0)}
                </span>
                <p className="text-2xl font-medium">{t.name}</p>
                {t.bio && <p className="text-lg text-white/70">{t.bio}</p>}
                <div className="flex flex-wrap justify-center gap-2">
                  {t.courses.map((c) => (
                    <Link key={c.slug} href={`/courses/${c.slug}`} className="rounded-full border border-white/15 px-3 py-1 text-base text-white/70 transition hover:border-accent hover:text-accent">
                      {c.title}
                    </Link>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="px-8 py-24">
        <SectionHeading tag="Values" title="What we stand for" />
        <div className="mx-auto mt-6 grid max-w-6xl gap-6 md:grid-cols-2">
          {values.map(({ title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="rounded-2xl bg-linear-to-b from-[#666666] to-black to-60% p-[.5px]">
              <div className="h-full rounded-2xl bg-black p-8">
                <h3 className="font-machina text-3xl">{title}</h3>
                <p className="mt-3 text-xl font-light text-[#D3D3D3]">{text}</p>
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
};

export default AboutPage;
