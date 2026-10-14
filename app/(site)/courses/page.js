import PageHero from "@/components/ui/page-hero";
import CourseGrid from "@/components/sections/course-grid";
import Faq from "@/components/sections/faq";
import { getSiteSettings } from "@/features/site-settings/queries";
import { getCatalog } from "@/features/courses/queries";

export const metadata = { title: "Courses", description: "Browse recorded courses in development, data, design, AI and freelancing with quizzes, projects and verifiable certificates.", alternates: { canonical: "/courses" } };

const CoursesPage = async () => {
  const [{ home }, courses] = await Promise.all([getSiteSettings(), getCatalog()]);
  return (
    <main>
      <PageHero tag="Courses" title="Programs built around real jobs" text="Recorded courses you can watch anytime, with quizzes, progress tracking and a verifiable certificate." />
      <CourseGrid courses={courses} />
      <Faq faqs={home.faqs} />
    </main>
  );
};

export default CoursesPage;
