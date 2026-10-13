import { getSiteSettings } from "@/features/site-settings/queries";
import LegalPage from "@/components/ui/legal-page";

export const metadata = { title: "Privacy Policy" };

const buildSections = ({ brand, contact }) => [
  {
    heading: "Information we collect",
    body: [
      "We collect the details you give us when you create an account, enroll, request a callback, or contact support, such as your name, email, phone number, and course preferences.",
      "We also collect basic usage data, like pages visited and lesson progress, so we can keep your learning on track.",
    ],
  },
  {
    heading: "How we use it",
    body: ["We use your information to deliver courses, track progress, issue certificates, process payments, respond to requests, and share updates you have opted into."],
  },
  {
    heading: "Sharing",
    body: [
      "We never sell your personal data. We share it only with service providers that help us run the platform, such as payment processors and email delivery, and with hiring partners only when you apply for a role.",
    ],
  },
  {
    heading: "Your choices",
    body: [`You can update your profile, unsubscribe from emails, or ask us to delete your account at any time by writing to ${contact.email}.`],
  },
  {
    heading: "Contact",
    body: [`Questions about privacy can be sent to ${contact.email}.`],
  },
];

const PrivacyPage = async () => <LegalPage tag="Legal" title="Privacy Policy" updated="October 13, 2026" sections={buildSections(await getSiteSettings())} />;

export default PrivacyPage;
