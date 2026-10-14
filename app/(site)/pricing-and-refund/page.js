import { getSiteSettings } from "@/features/site-settings/queries";
import LegalPage from "@/components/ui/legal-page";

export const metadata = { title: "Pricing & Refund Policy", description: "How course pricing, payments and refunds work.", alternates: { canonical: "/pricing-and-refund" } };

const buildSections = ({ brand, contact }) => [
  {
    heading: "Pricing",
    body: ["Course prices are listed on each course page in Pakistani Rupees and include access to live classes, recordings, projects, and mentor support for the program duration."],
  },
  {
    heading: "Payment",
    body: ["Payments are processed securely by our payment partners. Installment plans are available for selected programs."],
  },
  {
    heading: "Refunds",
    body: [
      "If a program is not right for you, request a refund within 7 days of the batch start date. Approved refunds are returned to the original payment method within 10 working days.",
      "Refunds are not available after the 7-day window or once a certificate has been issued.",
    ],
  },
  {
    heading: "How to request",
    body: [`Email ${contact.email} with your registered email and order details.`],
  },
];

const PricingRefundPage = async () => <LegalPage tag="Legal" title="Pricing & Refund Policy" updated="October 13, 2026" sections={buildSections(await getSiteSettings())} />;

export default PricingRefundPage;
