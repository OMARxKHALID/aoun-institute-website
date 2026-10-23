"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, CheckCircle2, Circle, Pencil, Plus, Square, SquareCheck, Trash2, X } from "lucide-react";
import { deleteQuestion, deleteQuiz, reorderQuestions, saveQuestion, updateQuizSettings } from "@/features/quizzes/actions";
import { DISPLAY_MODES, QUESTION_TYPES, SHOW_ANSWERS, questionSchema, quizSettingsSchema } from "@/features/quizzes/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import FormAlert from "@/components/ui/form-alert";
import StatusPill from "@/components/ui/status-pill";
import TabList from "@/components/ui/tab-list";
import { useDialog } from "@/components/ui/dialog-provider";
import { inputClass, labelClass } from "@/lib/ui";
import { plural } from "@/lib/format";
import { numberOrNull } from "@/lib/validate";

const firstError = (result) => Object.values(result.errors ?? {}).flat()[0] ?? "Something went wrong";

const applyErrors = (result, setError) => Object.entries(result.errors).forEach(([field, messages]) => setError(field === "root" ? "root" : field, { message: messages[0] }));

const SettingsForm = ({ quiz }) => {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(quizSettingsSchema),
    defaultValues: {
      title: quiz.title,
      description: quiz.description ?? "",
      passingPercent: quiz.passingPercent,
      maxAttempts: quiz.maxAttempts ?? null,
      drawCount: quiz.drawCount ?? null,
      timeLimitMin: quiz.timeLimitSec ? Math.round(quiz.timeLimitSec / 60) : null,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      showAnswers: quiz.showAnswers,
      displayMode: quiz.displayMode ?? "all",
      requiredForCertificate: quiz.requiredForCertificate,
      status: quiz.status,
    },
  });
  const { errors, isSubmitting } = formState;
  const optionalNumber = { setValueAs: numberOrNull };

  const handleSave = async (values) => {
    setSaved(false);
    const result = await updateQuizSettings(quiz.id, values);
    if (!result.ok) return applyErrors(result, setError);
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3 md:col-span-2">
        <FormAlert>{errors.root?.message}</FormAlert>
        {saved && <FormAlert type="success">Quiz settings saved.</FormAlert>}
      </div>
      <Field label="Quiz title" className="md:col-span-2" error={errors.title?.message} {...register("title")} />
      <Field label="Instructions (optional)" rows={3} className="md:col-span-2" error={errors.description?.message} {...register("description")} />
      <Field label="Pass mark (%)" type="number" min="0" max="100" error={errors.passingPercent?.message} {...register("passingPercent", { valueAsNumber: true })} />
      <Field label="Max attempts (empty = unlimited)" type="number" min="1" error={errors.maxAttempts?.message} {...register("maxAttempts", optionalNumber)} />
      <Field label="Questions per attempt (empty = all)" type="number" min="1" error={errors.drawCount?.message} {...register("drawCount", optionalNumber)} />
      <Field label="Time limit in minutes (empty = none)" type="number" min="0" error={errors.timeLimitMin?.message} {...register("timeLimitMin", optionalNumber)} />
      <Field label="Show correct answers" options={SHOW_ANSWERS} error={errors.showAnswers?.message} {...register("showAnswers")} />
      <Field label="Question layout" options={DISPLAY_MODES} error={errors.displayMode?.message} {...register("displayMode")} />
      <Checkbox label="Shuffle questions" hint="Every attempt gets a new question order." {...register("shuffleQuestions")} />
      <Checkbox label="Shuffle options" hint="Answer options appear in a random order." {...register("shuffleOptions")} />
      <Checkbox label="Required for certificate" hint="Students must pass this quiz to earn the certificate." {...register("requiredForCertificate")} />
      <Field label="Status" options={["draft", "published"]} error={errors.status?.message} {...register("status")} />
      <Button type="submit" loading={isSubmitting} className="self-start md:col-span-2 md:justify-self-start">
        Save Settings
      </Button>
    </form>
  );
};

const blankQuestion = { type: "single", prompt: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }], acceptedAnswers: [], points: 1, explanation: "" };

const trueFalse = [
  { text: "True", isCorrect: true },
  { text: "False", isCorrect: false },
];

const QuestionForm = ({ quizId, question, onDone }) => {
  const router = useRouter();
  const { register, control, handleSubmit, setError, setValue, getValues, formState } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: question ? { type: question.type, prompt: question.prompt, options: question.options, acceptedAnswers: question.acceptedAnswers ?? [], points: question.points, explanation: question.explanation ?? "" } : blankQuestion,
  });
  const { fields, append, remove, replace } = useFieldArray({ control, name: "options" });
  const type = useWatch({ control, name: "type" });
  const options = useWatch({ control, name: "options" }) ?? [];
  const { errors, isSubmitting } = formState;

  const handleType = (e) => {
    const next = e.target.value;
    setValue("type", next);
    if (next === "true_false") replace(trueFalse);
    else if (next === "short_answer") replace([]);
    else if (getValues("options").length < 2) replace(blankQuestion.options);
  };

  const handleCorrect = (index) => () => {
    const current = getValues("options");
    replace(current.map((o, i) => ({ ...o, isCorrect: type === "multiple" ? (i === index ? !o.isCorrect : o.isCorrect) : i === index })));
  };

  const handleSave = async (values) => {
    const result = await saveQuestion(quizId, question?.id ?? null, values);
    if (!result.ok) return applyErrors(result, setError);
    router.refresh();
    onDone();
  };

  const optionError = errors.options?.message ?? errors.options?.root?.message;

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate className="flex flex-col gap-4 rounded-2xl border border-accent/30 bg-[#070707] p-4 sm:p-5">
      <FormAlert>{errors.root?.message}</FormAlert>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <Field label="Question type" options={QUESTION_TYPES} error={errors.type?.message} {...register("type")} onChange={handleType} />
        <Field label="Points" type="number" min="1" max="100" error={errors.points?.message} {...register("points", { valueAsNumber: true })} />
      </div>
      <Field label="Question" rows={3} error={errors.prompt?.message} {...register("prompt")} />

      {type === "short_answer" ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="accepted-answers" className={labelClass}>
            Accepted answers (one per line)
          </label>
          <textarea
            id="accepted-answers"
            rows={3}
            defaultValue={(question?.acceptedAnswers ?? []).join("\n")}
            onChange={(e) => setValue("acceptedAnswers", e.target.value.split("\n").map((line) => line.trim()).filter(Boolean), { shouldValidate: false })}
            placeholder={"const\nthe const keyword"}
            className={inputClass}
          />
          <p className="text-xs text-white/50">Answers are matched ignoring capital letters, extra spaces and punctuation.</p>
          {errors.acceptedAnswers && <p className="text-sm text-red-400">{errors.acceptedAnswers.message ?? errors.acceptedAnswers.root?.message}</p>}
        </div>
      ) : (
      <div className="flex flex-col gap-2">
        <p className="text-base text-white/70">Answers {type === "multiple" ? "(tick every correct answer)" : "(tick the correct answer)"}</p>
        {fields.map((field, index) => {
          const correct = options[index]?.isCorrect;
          const Icon = type === "multiple" ? (correct ? SquareCheck : Square) : correct ? CheckCircle2 : Circle;
          return (
            <div key={field.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCorrect(index)}
                aria-label={correct ? "Correct answer" : "Mark as correct"}
                aria-pressed={correct}
                className={`grid size-10 shrink-0 place-items-center rounded-xl border transition ${correct ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-[#302C2A] text-white/50 hover:text-white"}`}
              >
                <Icon className="size-5" />
              </button>
              <input
                {...register(`options.${index}.text`)}
                readOnly={type === "true_false"}
                placeholder={`Option ${index + 1}`}
                aria-label={`Option ${index + 1}`}
                aria-invalid={Boolean(errors.options?.[index]?.text)}
                className={`min-w-0 flex-1 ${inputClass}`}
              />
              {type !== "true_false" && fields.length > 2 && (
                <button type="button" onClick={() => remove(index)} aria-label={`Remove option ${index + 1}`} className="grid size-10 shrink-0 place-items-center rounded-xl text-white/50 hover:bg-red-500/10 hover:text-red-400">
                  <X className="size-4" />
                </button>
              )}
            </div>
          );
        })}
        {optionError && <p className="text-sm text-red-400">{optionError}</p>}
        {type !== "true_false" && fields.length < 10 && (
          <button type="button" onClick={() => append({ text: "", isCorrect: false })} className="flex items-center gap-1.5 self-start rounded-xl border border-dashed border-white/25 px-3 py-1.5 text-sm text-white/70 hover:border-accent hover:text-accent">
            <Plus className="size-4" /> Add option
          </button>
        )}
      </div>
      )}

      <Field label="Explanation shown after answering (optional)" rows={2} error={errors.explanation?.message} {...register("explanation")} />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={isSubmitting}>
          {question ? "Save Question" : "Add Question"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

const QuestionList = ({ quizId, questions }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [editing, setEditing] = useState(null);
  const [list, setList] = useState(questions);
  const [error, setError] = useState(null);

  useEffect(() => setList(questions), [questions]);

  const handleMove = (index, delta) => async () => {
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setList(next);
    const result = await reorderQuestions(quizId, next.map((q) => q.id));
    if (!result.ok) {
      setError(firstError(result));
      setList(questions);
      return;
    }
    router.refresh();
  };

  const handleDelete = (question) => async () => {
    if (!(await dialog.confirm({ title: "Delete this question?", message: "Past attempts keep their scores.", confirmLabel: "Delete", danger: true }))) return;
    const result = await deleteQuestion(quizId, question.id);
    if (!result.ok) return setError(firstError(result));
    router.refresh();
  };

  const total = list.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-white/50">
        {plural(list.length, "question")} · {plural(total, "point")}
      </p>
      <FormAlert>{error}</FormAlert>
      {list.map((q, index) =>
        editing === q.id ? (
          <QuestionForm key={q.id} quizId={quizId} question={q} onDone={() => setEditing(null)} />
        ) : (
          <article key={q.id} className="flex gap-3 rounded-2xl border border-white/5 bg-[#070707] p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-sm font-semibold text-accent">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="whitespace-pre-line break-words">{q.prompt}</p>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {q.type === "short_answer"
                  ? (q.acceptedAnswers ?? []).map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-green-400">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                        <span className="break-words">{a}</span>
                      </li>
                    ))
                  : q.options.map((o, i) => (
                      <li key={i} className={`flex items-start gap-2 ${o.isCorrect ? "text-green-400" : "text-white/50"}`}>
                        {o.isCorrect ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <Circle className="mt-0.5 size-4 shrink-0" />}
                        <span className="break-words">{o.text}</span>
                      </li>
                    ))}
              </ul>
              <p className="mt-2 text-xs text-white/50">
                {QUESTION_TYPES.find((t) => t.value === q.type)?.label} · {q.points} {q.points === 1 ? "point" : "points"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-start">
              <button type="button" onClick={handleMove(index, -1)} disabled={index === 0} aria-label="Move question up" className="grid size-8 place-items-center rounded-lg text-white/50 hover:bg-white/5 disabled:opacity-25">
                <ArrowUp className="size-4" />
              </button>
              <button type="button" onClick={handleMove(index, 1)} disabled={index === list.length - 1} aria-label="Move question down" className="grid size-8 place-items-center rounded-lg text-white/50 hover:bg-white/5 disabled:opacity-25">
                <ArrowDown className="size-4" />
              </button>
              <button type="button" onClick={() => setEditing(q.id)} aria-label="Edit question" className="grid size-8 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white">
                <Pencil className="size-4" />
              </button>
              <button type="button" onClick={handleDelete(q)} aria-label="Delete question" className="grid size-8 place-items-center rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-400">
                <Trash2 className="size-4" />
              </button>
            </div>
          </article>
        ),
      )}
      {list.length === 0 && editing !== "new" && <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-white/50">No questions yet. Add the first one.</p>}
      {editing === "new" ? (
        <QuestionForm quizId={quizId} onDone={() => setEditing(null)} />
      ) : (
        <button type="button" onClick={() => setEditing("new")} className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 px-4 py-3 text-white/70 transition hover:border-accent hover:text-accent">
          <Plus className="size-4" /> Add question
        </button>
      )}
    </div>
  );
};

const tabs = ["Questions", "Settings"];

const QuizBuilder = ({ courseId, quiz, questions, attempts }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [tab, setTab] = useState(tabs[0]);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!(await dialog.confirm({ title: `Delete "${quiz.title}"?`, message: `Its questions${attempts ? ` and ${attempts} student attempts` : ""} are deleted too. This cannot be undone.`, confirmLabel: "Delete quiz", danger: true }))) return;
    const result = await deleteQuiz(quiz.id);
    if (!result.ok) return setError(firstError(result));
    router.push(`/admin/courses/${courseId}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill status={quiz.status} />
        <span className="text-sm text-white/50">
          Pass mark {quiz.passingPercent}% · {quiz.maxAttempts ? plural(quiz.maxAttempts, "attempt") : "unlimited attempts"}
          {quiz.timeLimitSec ? ` · ${Math.round(quiz.timeLimitSec / 60)} min` : ""}
        </span>
        {quiz.status === "draft" && questions.length > 0 && <span className="text-sm text-amber-300/80">Draft: publish it in Settings so students can take it.</span>}
      </div>
      <TabList tabs={tabs} value={tab} onChange={setTab} label="Quiz editor" />
      <div hidden={tab !== "Questions"}>
        <QuestionList quizId={quiz.id} questions={questions} />
      </div>
      <div hidden={tab !== "Settings"} className="flex flex-col gap-8">
        <SettingsForm quiz={quiz} />
        <div className="flex flex-col gap-3 rounded-2xl border border-red-500/30 p-5">
          <p className="font-medium text-red-400">Delete quiz</p>
          <p className="text-sm text-white/50">Removes the quiz, its questions and all student attempts.</p>
          <FormAlert>{error}</FormAlert>
          <Button type="button" variant="danger" onClick={handleDelete} className="self-start">
            Delete Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;
