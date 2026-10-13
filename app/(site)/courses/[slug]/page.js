import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CalendarDays, CircleCheck, Headset, Radio, Signal } from "lucide-react";
import { courses, findCourse } from "@/lib/data";
import PageHero from "@/components/ui/page-hero";
import SectionHeading from "@/components/ui/section-heading";
import CourseCard from "@/components/ui/course-card";
import Reveal from "@/components/motion/reveal";

export const instant = false;

export const generateStaticParams = () => courses.map(({ slug }) => ({ slug }));

export const generateMetadata = async ({ params }) => {
  const { slug } = await params;
  return { title: findCourse(slug)?.title ?? "Course" };
};

const CourseDetailPage = async ({ params }) => {
  const { slug } = await params;
  const course = findCourse(slug);
  if (!course) notFound();

  const facts = [
    { icon: CalendarDays, label: "Duration", value: course.duration },
    { icon: Radio, label: "Mode", value: course.mode },
    { icon: Signal, label: "Level", value: course.level },
    { icon: Award, label: "Certificate", value: "Yes" },
    { icon: Headset, label: "Mentor Support", value: "24/7" },
  ];

  const related = courses.filter((c) => c.slug !== slug).slice(0, 3);

  return (
    <main>
      <PageHero tag={course.category} title={course.title} text={course.blurb}>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`/signin?next=/courses/${slug}`}
            className="rounded-2xl bg-linear-to-b from-[#E8602E] to-[#A8401A] px-10 py-4 text-xl font-bold transition-shadow hover:shadow-[0_0_40px_5px_rgba(232,96,46,0.5)]"
          >
            Enroll for {course.price.now}
          </Link>
          <Link href="/request-callback" className="rounded-2xl border border-white/30 px-10 py-4 text-xl transition-colors hover:border-accent hover:text-accent">
            Talk to a counselor
          </Link>
        </div>
      </PageHero>

      <section className="mx-auto grid w-[90%] grid-cols-2 gap-4 pb-20 md:grid-cols-3 lg:w-[80%] lg:grid-cols-5">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#302C2A] p-5">
            <span className="rounded-xl bg-[#FDEFEA] p-3 text-accent">
              <Icon className="size-6" />
            </span>
            <div>
              <p className="text-lg font-semibold">{value}</p>
              <p className="text-sm text-white/50">{label}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-2 rounded-4xl bg-[#FFF3EF] px-6 py-20 text-black sm:mx-4">
        <SectionHeading light tag="Curriculum" title="What you will learn, module by module" />
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {course.modules.map(({ title, topics }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <details open={i === 0} className="group rounded-2xl border border-[#CACACA]/50 bg-white p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-4">
                    <span className="font-machina text-3xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-2xl font-medium">{title}</span>
                  </span>
                  <span className="text-2xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <ul className="mt-4 grid gap-2 pl-14 text-lg text-black/70 sm:grid-cols-2">
                  {topics.map((t) => (
                    <li key={t} className="list-disc">{t}</li>
                  ))}
                </ul>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-8 py-24">
        <SectionHeading tag="Outcomes" title="Where you will be when you finish" />
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {course.outcomes.map((o) => (
            <div key={o} className="flex items-start gap-3 rounded-2xl border border-[#302C2A] p-6">
              <CircleCheck className="mt-1 size-6 shrink-0 text-green-500" />
              <p className="text-xl">{o}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-[90%] pb-24 lg:w-[85%]">
        <SectionHeading tag="More Courses" title="Keep exploring" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((c) => (
            <CourseCard key={c.slug} {...c} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default CourseDetailPage;
