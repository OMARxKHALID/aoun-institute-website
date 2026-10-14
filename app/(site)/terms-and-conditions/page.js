import { getSiteSettings } from "@/features/site-settings/queries";
import LegalPage from "@/components/ui/legal-page";

export const metadata = { title: "Terms & Conditions", description: "The terms for using the website and our courses.", alternates: { canonical: "/terms-and-conditions" } };

const buildSections = ({ brand, contact }) => [
  {
    heading: "Using the platform",
    body: [`By creating an account with ${brand.name}, you agree to use the platform for personal learning and to keep your login details private.`],
  },
  {
    heading: "Course access",
    body: [
      "Enrollment gives you a personal, non-transferable license to access course content. Sharing accounts or redistributing course material is not allowed.",
    ],
  },
  {
    heading: "Conduct",
    body: ["Be respectful in classes, community spaces, and reviews. We may suspend accounts that harass others or misuse the platform."],
  },
  {
    heading: "Certificates",
    body: ["Certificates are issued after completing the required projects and assessments. We may revoke certificates obtained through plagiarism."],
  },
  {
    heading: "Changes",
    body: ["We may update these terms from time to time. We will notify you of significant changes by email or on this page."],
  },
];

const TermsPage = async () => <LegalPage tag="Legal" title="Terms & Conditions" updated="October 13, 2026" sections={buildSections(await getSiteSettings())} />;

export default TermsPage;
