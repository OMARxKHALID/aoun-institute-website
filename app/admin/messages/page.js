import { getContactMessages } from "@/features/contact/queries";
import MessageTable from "@/features/contact/components/message-table";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Messages" };

const AdminMessagesPage = async () => {
  const messages = await getContactMessages();
  const unread = messages.filter((m) => m.status === "new").length;
  return (
    <>
      <PanelHeader title="Messages" subtitle={unread ? `${unread} new ${unread === 1 ? "message" : "messages"} from the contact form` : "You are all caught up"} />
      <div className="p-4 sm:p-5 lg:p-8">
        <MessageTable messages={messages} />
      </div>
    </>
  );
};

export default AdminMessagesPage;
