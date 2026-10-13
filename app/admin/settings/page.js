import { requireAdmin } from "@/lib/dal";
import { getSiteSettings } from "@/features/site-settings/queries";
import SettingsForm from "@/features/site-settings/components/settings-form";

export const metadata = { title: "Site Settings" };

const AdminSettingsPage = async () => {
  await requireAdmin();
  const settings = await getSiteSettings();
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <h1 className="font-machina text-4xl">Site Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
};

export default AdminSettingsPage;
