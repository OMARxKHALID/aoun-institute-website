import { getAuditLogs } from "@/features/audit/queries";
import ActivityTable from "@/features/audit/components/activity-table";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Activity Log" };

const ActivityPage = async () => {
  const logs = await getAuditLogs();
  return (
    <>
      <PanelHeader title="Activity log" subtitle="Every change made in the admin panel, newest first." />
      <div className="p-4 sm:p-5 lg:p-8">
        <ActivityTable logs={logs} />
      </div>
    </>
  );
};

export default ActivityPage;
