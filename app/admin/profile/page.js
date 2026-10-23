import { getProfile } from "@/features/profile/queries";
import SettingsForms from "@/features/profile/components/settings-forms";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "My profile" };

const AdminProfilePage = async () => {
  const profile = await getProfile();
  return (
    <>
      <PanelHeader title="My profile" subtitle="Your name, photo, email and password." />
      <div className="p-4 sm:p-5 lg:p-8">
        <SettingsForms profile={profile} staff />
      </div>
    </>
  );
};

export default AdminProfilePage;
