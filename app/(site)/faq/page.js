import PageHero from "@/components/ui/page-hero";
import Faq from "@/components/sections/faq";
import { getSiteSettings } from "@/features/site-settings/queries";

export const metadata = { title: "FAQ" };

const FaqPage = async () => {
  const { home } = await getSiteSettings();
  return (
    <main>
      <PageHero tag="FAQ" title="Answers to common questions" text="Everything about courses, payments, certificates, and your account." />
      <Faq faqs={home.faqs} />
    </main>
  );
};

export default FaqPage;
