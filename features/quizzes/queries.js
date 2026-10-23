import "server-only";
import { Types, isValidObjectId } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { requireStaff, requireUser } from "@/lib/dal";
import { canTeach } from "@/features/courses/access";
import Course from "@/features/courses/models/course";
import Section from "@/features/courses/models/section";
import Lesson from "@/features/courses/models/lesson";
import Quiz from "@/features/quizzes/models/quiz";
import Question from "@/features/quizzes/models/question";
import QuizAttempt from "@/features/quizzes/models/quiz-attempt";
import AttemptGrant from "@/features/quizzes/models/attempt-grant";
import Enrollment from "@/features/enrollments/model";
import { buildOutline } from "@/features/progress/service";
import { findQuizState, gradeAttempt, isExpired } from "@/features/quizzes/service";
import { isAnswerCorrect } from "@/features/quizzes/grading";

const plain = (value) => JSON.parse(JSON.stringify(value));

export const getQuizForEdit = async (courseId, quizId) => {
  const user = await requireStaff();
  if (!isValidObjectId(courseId) || !isValidObjectId(quizId) || !(await canTeach(user, courseId))) return null;
  await connectDB();
  const quiz = await Quiz.findOne({ _id: quizId, courseId }).lean();
  if (!quiz) return null;
  const [course, section, lesson, questions, attempts] = await Promise.all([
    Course.findById(courseId, "title").lean(),
    quiz.sectionId ? Section.findById(quiz.sectionId, "title").lean() : null,
    quiz.lessonId ? Lesson.findById(quiz.lessonId, "title").lean() : null,
    Question.find({ quizId }).sort({ order: 1 }).lean(),
    QuizAttempt.countDocuments({ quizId, status: { $ne: "in_progress" } }),
  ]);
  return plain({
    course: { id: String(course._id), title: course.title },
    quiz: { ...quiz, id: String(quiz._id) },
    attachedTo: lesson ? `After lesson: ${lesson.title}` : section ? `End of section: ${section.title}` : "Course",
    questions: questions.map((q) => ({ ...q, id: String(q._id), options: q.options.map(({ text, isCorrect }) => ({ text, isCorrect })), acceptedAnswers: q.acceptedAnswers ?? [] })),
    attempts,
  });
};

const showAnswersFor = (quiz, attempt, everPassed) => quiz.showAnswers === "always" || (quiz.showAnswers === "after_pass" && (attempt.passed || everPassed));

export const getStudentQuiz = async (quizId) => {
  const user = await requireUser();
  await connectDB();
  const found = await findQuizState(user, quizId);
  if (!found?.state) return null;
  const { quiz, state, course, lesson } = found;
  const [questionCount, attempts] = await Promise.all([
    Question.countDocuments({ quizId }),
    QuizAttempt.find({ userId: user.id, quizId }, "attemptNo status percent passed score maxScore startedAt submittedAt").sort({ attemptNo: -1 }).lean(),
  ]);
  return plain({
    quiz: { id: String(quiz._id), title: quiz.title, description: quiz.description, passingPercent: quiz.passingPercent, maxAttempts: state.maxAttempts, timeLimitSec: quiz.timeLimitSec, questionCount },
    course: { title: course.title, slug: course.slug },
    lesson: lesson ? { id: lesson.id, title: lesson.title } : null,
    state,
    attempts: attempts.map((a) => ({ ...a, id: String(a._id) })),
  });
};

export const getAttemptView = async (attemptId) => {
  const user = await requireUser();
  if (!isValidObjectId(attemptId)) return null;
  await connectDB();
  let attempt = await QuizAttempt.findOne({ _id: attemptId, userId: user.id });
  if (!attempt) return null;
  if (attempt.status === "in_progress" && isExpired(attempt)) attempt = await gradeAttempt(user, attempt, true);
  const quiz = await Quiz.findById(attempt.quizId).lean();
  const course = await Course.findById(attempt.courseId, "title slug").lean();
  const questions = await Question.find({ quizId: attempt.quizId }).lean();
  const byId = new Map(questions.map((q) => [String(q._id), q]));
  const optionOrder = attempt.optionOrder ?? new Map();
  const done = attempt.status !== "in_progress";
  const everPassed = done && (await QuizAttempt.exists({ userId: user.id, quizId: attempt.quizId, passed: true }));
  const reveal = done && showAnswersFor(quiz, attempt, everPassed);
  const items = attempt.questionOrder
    .map((questionId) => {
      const q = byId.get(String(questionId));
      if (!q) return null;
      const order = (optionOrder.get(String(questionId)) ?? q.options.map((o) => o._id)).map(String);
      const answer = attempt.answers.find((a) => String(a.questionId) === String(questionId));
      const selected = (answer?.selected ?? []).map(String);
      return {
        id: String(q._id),
        type: q.type,
        prompt: q.prompt,
        points: q.points,
        selected,
        options: order
          .map((oid) => q.options.find((o) => String(o._id) === oid))
          .filter(Boolean)
          .map((o) => ({ id: String(o._id), text: o.text, ...(reveal && { isCorrect: o.isCorrect }) })),
        text: answer?.text ?? "",
        ...(done && { correct: isAnswerCorrect(q, answer) }),
        ...(reveal && q.type === "short_answer" && { acceptedAnswers: q.acceptedAnswers ?? [] }),
        ...(reveal && { explanation: q.explanation ?? "" }),
      };
    })
    .filter(Boolean);
  return plain({
    attempt: {
      id: String(attempt._id),
      attemptNo: attempt.attemptNo,
      status: attempt.status,
      expiresAt: attempt.expiresAt,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percent: attempt.percent,
      passed: attempt.passed,
      submittedAt: attempt.submittedAt,
    },
    quiz: { id: String(quiz._id), title: quiz.title, passingPercent: quiz.passingPercent, displayMode: quiz.displayMode },
    course: { title: course?.title, slug: course?.slug },
    reveal,
    questions: items,
  });
};

export const getStudentQuizzes = async () => {
  const user = await requireUser();
  await connectDB();
  const enrollments = await Enrollment.find({ userId: user.id, status: "active" }, "courseId").lean();
  const outlines = await Promise.all(enrollments.map((e) => buildOutline(user.id, e.courseId)));
  return plain(
    outlines
      .filter(Boolean)
      .flatMap((o) =>
        o.outline.flatMap((s) =>
          [...s.lessons.map((l) => l.quiz && { ...l.quiz, after: l.title }), ...s.quizzes.map((q) => ({ ...q, after: s.title }))]
            .filter(Boolean)
            .map((q) => ({ ...q, course: o.course.title })),
        ),
      ),
  );
};

export const getQuizResults = async (quizId) => {
  const user = await requireStaff();
  if (!isValidObjectId(quizId)) return null;
  await connectDB();
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz || !(await canTeach(user, quiz.courseId))) return null;
  const [course, questions, attempts] = await Promise.all([
    Course.findById(quiz.courseId, "title").lean(),
    Question.find({ quizId }).sort({ order: 1 }).lean(),
    QuizAttempt.find({ quizId, status: { $ne: "in_progress" } }).sort({ submittedAt: -1 }).lean(),
  ]);
  const ids = [...new Set(attempts.map((a) => a.userId))].filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id));
  const users = await db.collection("user").find({ _id: { $in: ids } }, { projection: { name: 1, email: 1 } }).toArray();
  const byUser = new Map(users.map((u) => [String(u._id), u]));
  const perQuestion = questions.map((q, i) => {
    const answered = attempts.map((a) => a.answers.find((x) => String(x.questionId) === String(q._id)));
    const right = answered.filter((x) => x && isAnswerCorrect(q, x)).length;
    return { id: String(q._id), number: i + 1, prompt: q.prompt, rate: attempts.length ? Math.round((right / attempts.length) * 100) : 0 };
  });
  const students = new Set(attempts.map((a) => a.userId)).size;
  const passedIds = new Set(attempts.filter((a) => a.passed).map((a) => a.userId));
  const passedStudents = passedIds.size;
  const grants = quiz.maxAttempts ? await AttemptGrant.find({ quizId }, "userId extra").lean() : [];
  const extraBy = new Map(grants.map((g) => [g.userId, g.extra]));
  const countBy = Map.groupBy(attempts, (a) => a.userId);
  const latestIds = new Set([...countBy.values()].map((list) => String(list[0]._id)));
  const canGrant = (a) =>
    Boolean(quiz.maxAttempts) && latestIds.has(String(a._id)) && byUser.has(a.userId) && !passedIds.has(a.userId) && countBy.get(a.userId).length >= quiz.maxAttempts + (extraBy.get(a.userId) ?? 0);
  return plain({
    quiz: { id: String(quiz._id), title: quiz.title, courseId: String(quiz.courseId), passingPercent: quiz.passingPercent, maxAttempts: quiz.maxAttempts ?? null },
    course: { title: course?.title },
    stats: {
      attempts: attempts.length,
      students,
      average: attempts.length ? Math.round(attempts.reduce((sum, a) => sum + (a.percent ?? 0), 0) / attempts.length) : 0,
      passRate: students ? Math.round((passedStudents / students) * 100) : 0,
    },
    perQuestion,
    rows: attempts.map((a) => ({
      id: String(a._id),
      userId: a.userId,
      student: byUser.get(a.userId)?.name ?? "Former student",
      email: byUser.get(a.userId)?.email ?? "",
      attemptNo: a.attemptNo,
      score: `${a.score ?? 0}/${a.maxScore ?? 0}`,
      percent: a.percent ?? 0,
      passed: Boolean(a.passed),
      status: a.status,
      submittedAt: a.submittedAt,
      durationSec: a.submittedAt ? Math.round((new Date(a.submittedAt) - new Date(a.startedAt)) / 1000) : 0,
      canGrant: canGrant(a),
    })),
  });
};
