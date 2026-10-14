import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { getQuizForEdit } from "@/features/quizzes/queries";
import QuizBuilder from "@/features/quizzes/components/quiz-builder";
import PanelHeader from "@/components/ui/panel-header";
import { buttonClass } from "@/lib/ui";

export const metadata = { title: "Edit Quiz" };

const EditQuizPage = async ({ params }) => {
  const { id, quizId } = await params;
  const data = await getQuizForEdit(id, quizId);
  if (!data) notFound();
  return (
    <>
      <PanelHeader back={{ href: `/admin/courses/${id}`, label: data.course.title }} title={data.quiz.title} subtitle={data.attachedTo}>
        <Link href={`/admin/quizzes/${quizId}/results`} className={`${buttonClass("outline")} max-sm:hidden`}>
          <BarChart3 className="size-4 text-accent" /> Results ({data.attempts})
        </Link>
      </PanelHeader>
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:p-8">
        <Link href={`/admin/quizzes/${quizId}/results`} className={`${buttonClass("outline")} sm:hidden`}>
          <BarChart3 className="size-4 text-accent" /> Results ({data.attempts})
        </Link>
        <QuizBuilder courseId={id} quiz={data.quiz} questions={data.questions} attempts={data.attempts} />
      </div>
    </>
  );
};

export default EditQuizPage;
