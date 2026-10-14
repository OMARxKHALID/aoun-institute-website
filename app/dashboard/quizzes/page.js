import { getStudentQuizzes } from "@/features/quizzes/queries";
import StudentQuizTable from "@/features/quizzes/components/student-quiz-table";
import PanelHeader from "@/components/ui/panel-header";

export const metadata = { title: "Quizzes" };

const QuizzesPage = async () => {
  const quizzes = await getStudentQuizzes();
  const open = quizzes.filter((q) => q.status === "available" || q.status === "retry").length;
  return (
    <>
      <PanelHeader title="Quizzes" subtitle={open ? `${open} ${open === 1 ? "quiz is" : "quizzes are"} ready for you` : "Finish lessons to unlock their quizzes."} />
      <div className="p-4 sm:p-5 lg:p-8">
        <StudentQuizTable quizzes={quizzes} />
      </div>
    </>
  );
};

export default QuizzesPage;
