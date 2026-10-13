import PageHero from "@/components/ui/page-hero";
import CourseGrid from "@/components/sections/course-grid";
import Faq from "@/components/sections/faq";
import { getSiteSettings } from "@/features/site-settings/queries";

export const metadata = { title: "Courses" };

const CoursesPage = async () => {
  const { home } = await getSiteSettings();
  return (
  <main>
    <PageHero tag="Courses" title="Programs built around real jobs" text="Live cohorts and self-paced tracks with mentor reviews, projects, and placement support." />
    <CourseGrid />
    <Faq faqs={home.faqs} />
  </main>
  );
};

export default CoursesPage;
