import { getAdminAnnouncements } from "@/features/announcements/queries";
import AnnouncementManager from "@/features/announcements/components/announcement-manager";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Announcements" };

const AdminAnnouncementsPage = async () => {
  const { announcements, courses } = await getAdminAnnouncements();
  return (
    <>
      <PanelHeader title="Announcements" subtitle="Post updates to the students of a course." />
      <div className="p-4 sm:p-5 lg:p-8">
        <AnnouncementManager announcements={announcements} courses={courses} />
      </div>
    </>
  );
};

export default AdminAnnouncementsPage;
