import { getSiteSettings } from "@/features/site-settings/queries";
import SettingsForm from "@/features/site-settings/components/settings-form";
import PanelHeader from "@/components/ui/panel-header";
import { requireAdmin } from "@/lib/dal";

export const metadata = { title: "Site Settings" };

const AdminSettingsPage = async () => {
  await requireAdmin();
  const settings = await getSiteSettings();
  return (
    <>
      <PanelHeader title="Site Settings" subtitle="Brand, contact, homepage content, SEO and payment details" />
      <div className="p-4 sm:p-5 lg:p-8">
        <SettingsForm settings={settings} />
      </div>
    </>
  );
};

export default AdminSettingsPage;
