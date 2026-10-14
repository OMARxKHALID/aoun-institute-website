import { getAdminCertificates } from "@/features/certificates/queries";
import CertificateTable from "@/features/certificates/components/certificate-table";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Certificates" };

const AdminCertificatesPage = async () => {
  const { certificates, courses } = await getAdminCertificates();
  const valid = certificates.filter((c) => c.status === "VALID").length;
  return (
    <>
      <PanelHeader title="Certificates" subtitle={`${valid} valid · ${certificates.length - valid} revoked`} />
      <div className="p-4 sm:p-5 lg:p-8">
        <CertificateTable certificates={certificates} courses={courses} />
      </div>
    </>
  );
};

export default AdminCertificatesPage;
