import Hero from "@/components/sections/hero";
import LogoMarquee from "@/components/sections/logo-marquee";
import Impact from "@/components/sections/impact";
import Courses from "@/components/sections/courses";
import Testimonials from "@/components/sections/testimonials";
import FreePreviews from "@/components/sections/free-previews";
import Worldwide from "@/components/sections/worldwide";
import Community from "@/components/sections/community";
import Comparison from "@/components/sections/comparison";
import Faq from "@/components/sections/faq";
import Cta from "@/components/sections/cta";
import { getSiteSettings } from "@/features/site-settings/queries";
import { getCatalog, getFreePreviews } from "@/features/courses/queries";
import { getPublicStats } from "@/features/analytics/public-stats";
import JsonLd from "@/components/ui/json-ld";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const metadata = { alternates: { canonical: "/" } };

const Home = async () => {
  const [{ brand, hero, home, contact, socials, seo }, courses, stats, previews] = await Promise.all([getSiteSettings(), getCatalog(), getPublicStats(), getFreePreviews()]);
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
      <Hero hero={hero} stats={home.stats} live={stats} courses={courses} />
      {home.partners?.length > 0 && <LogoMarquee partners={home.partners} />}
      {home.impactCards?.length > 0 && <Impact impactCards={home.impactCards} />}
      <Courses courses={courses} />
      {home.testimonials?.length > 0 && <Testimonials testimonials={home.testimonials} />}
      <Worldwide stats={stats} />
      <FreePreviews previews={previews} />
      {home.communityTiles?.length > 0 && <Community communityTiles={home.communityTiles} />}
      <Comparison brand={brand} />
      <Faq faqs={home.faqs} />
      <Cta brand={brand} courses={courses} />
    </main>
  );
};

export default Home;
