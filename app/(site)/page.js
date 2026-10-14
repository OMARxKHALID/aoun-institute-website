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
import JsonLd from "@/components/ui/json-ld";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const metadata = { alternates: { canonical: "/" } };

const Home = async () => {
  const [{ brand, hero, home, contact, socials, seo }, courses] = await Promise.all([getSiteSettings(), getCatalog()]);
  const organization = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: brand.name,
    url: SITE_URL,
    description: seo.description,
    logo: brand.logo?.url,
    email: contact.email,
    telephone: contact.phone,
    address: contact.address,
    sameAs: socials.map((s) => s.url).filter(Boolean),
    hasCourse: courses.map((c) => ({ "@type": "Course", name: c.title, url: absoluteUrl(`/courses/${c.slug}`) })),
  };
  return (
    <main className="relative isolate">
      <JsonLd data={organization} />
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
