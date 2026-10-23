import SectionHeading from "@/components/ui/section-heading";
import GlowButton from "@/components/ui/glow-button";
import Reveal from "@/components/motion/reveal";
import Flag from "@/components/ui/flag";

const number = (value) => value.toLocaleString("en-US");

const Worldwide = ({ stats }) => {
  if (!stats?.students) return null;
  const { students, graduates, courses, countries } = stats;
  const items = [
    [students, "Students enrolled"],
    [graduates, "Graduates"],
    [Math.max(countries.length, 1), countries.length === 1 ? "Country" : "Countries"],
    [courses, "Courses"],
  ];

  return (
    <section className="flex w-full flex-col items-center rounded-4xl bg-[#FFF3EF] px-5 py-20 text-black sm:px-10">
      <SectionHeading light tag="Worldwide" title="Our classroom has no borders" />
      <Reveal className="grid w-full max-w-6xl grid-cols-2 gap-px border-y border-black/15 bg-black/15 lg:grid-cols-4">
        {items.map(([value, label]) => (
          <div key={label} className="flex flex-col items-center gap-1 bg-[#FFF3EF] px-2 py-8">
            <p className="font-machina text-5xl tracking-tighter text-accent sm:text-6xl md:text-7xl">{number(value)}</p>
            <p className="text-center text-lg font-normal capitalize text-black/70 md:text-xl">{label}</p>
          </div>
        ))}
      </Reveal>
      {countries.length > 0 && (
        <Reveal className="mt-12 w-full max-w-6xl">
          <ul className="flex flex-wrap justify-center gap-2.5 md:gap-3">
            {countries.map((c) => (
              <li key={c.code} className="flex items-center gap-2.5 rounded-full border-[0.5px] border-black/20 bg-white py-1.5 pl-1.5 pr-4 text-base font-normal md:gap-3 md:py-2 md:pl-2 md:pr-5 md:text-lg">
                <Flag code={c.code} name={c.name} className="aspect-square h-8 w-auto rounded-full object-cover ring-0 md:h-9" />
                {c.name}
                <span className="font-medium text-accent">{number(c.count)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
      <GlowButton href="/courses" className="mt-12">
        Join them
      </GlowButton>
    </section>
  );
};

export default Worldwide;
