import PageHero from "@/components/ui/page-hero";
import VerifyForm from "@/features/certificates/components/verify-form";

export const metadata = { title: "Verify a Certificate", description: "Check that a certificate issued by the institute is genuine." };

const VerifyPage = () => (
  <main className="pb-24">
    <PageHero tag="Verify" title="Verify a certificate" text="Enter the certificate ID printed on the certificate or scan its QR code.">
      <div className="mt-4 flex w-full justify-center">
        <VerifyForm />
      </div>
    </PageHero>
  </main>
);

export default VerifyPage;
