import Hero from "@/components/sections/hero";
import LogoMarquee from "@/components/sections/logo-marquee";
import Impact from "@/components/sections/impact";
import Courses from "@/components/sections/courses";
import Testimonials from "@/components/sections/testimonials";
import Youtube from "@/components/sections/youtube";
import Community from "@/components/sections/community";
import Comparison from "@/components/sections/comparison";
import Faq from "@/components/sections/faq";
import Cta from "@/components/sections/cta";
import { getSiteSettings } from "@/features/site-settings/queries";
import { getCatalog } from "@/features/courses/queries";

const Home = async () => {
  const [{ brand, hero, home }, courses] = await Promise.all([getSiteSettings(), getCatalog()]);
  return (
    <main className="relative isolate">
      <Hero hero={hero} stats={home.stats} />
      <LogoMarquee partners={home.partners} />
      <Impact impactCards={home.impactCards} />
      <Courses courses={courses} />
      <Testimonials testimonials={home.testimonials} />
      <Youtube />
      <Community communityTiles={home.communityTiles} />
      <Comparison brand={brand} />
      <Faq faqs={home.faqs} />
      <Cta brand={brand} />
    </main>
  );
};

export default Home;
