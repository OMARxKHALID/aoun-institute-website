import { getProfile } from "@/features/profile/queries";
import SettingsForms from "@/features/profile/components/settings-forms";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Settings" };

const SettingsPage = async () => {
  const profile = await getProfile();
  return (
    <>
      <PanelHeader title="Settings" subtitle="Your profile, password and email preferences." />
      <div className="p-4 sm:p-5 lg:p-8">
        <SettingsForms profile={profile} />
      </div>
    </>
  );
};

export default SettingsPage;
