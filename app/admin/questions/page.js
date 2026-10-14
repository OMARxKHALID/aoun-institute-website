import { getAdminQuestions } from "@/features/discussions/queries";
import AdminQuestions from "@/features/discussions/components/admin-questions";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Questions" };

const AdminQuestionsPage = async () => {
  const threads = await getAdminQuestions();
  const open = threads.filter((t) => !t.answered).length;
  return (
    <>
      <PanelHeader title="Student questions" subtitle={open ? `${open} ${open === 1 ? "question needs" : "questions need"} an answer` : "Every question is answered"} />
      <div className="p-4 sm:p-5 lg:p-8">
        <AdminQuestions threads={threads} />
      </div>
    </>
  );
};

export default AdminQuestionsPage;
