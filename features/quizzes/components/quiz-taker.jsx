"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, Loader2, Send, Square, SquareCheck } from "lucide-react";
import { saveAnswers, submitAttempt } from "@/features/quizzes/student-actions";
import FormAlert from "@/components/ui/form-alert";
import { btn } from "@/lib/ui";

const toPayload = (answers) => Object.entries(answers).map(([questionId, selected]) => ({ questionId, selected }));

const formatClock = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const QuizTaker = ({ attempt, quiz, questions }) => {
  const router = useRouter();
  const [answers, setAnswers] = useState(() => Object.fromEntries(questions.map((q) => [q.id, q.selected])));
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState("idle");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(() => (attempt.expiresAt ? new Date(attempt.expiresAt).getTime() - Date.now() : null));
  const dirty = useRef(false);
  const answersRef = useRef(answers);
  const one = quiz.displayMode === "one";

  answersRef.current = answers;

  const submit = async () => {
    setSubmitting(true);
    const result = await submitAttempt(attempt.id, toPayload(answersRef.current));
    if (!result.ok) {
      setSubmitting(false);
      return setError(Object.values(result.errors).flat()[0]);
    }
    router.refresh();
  };

  useEffect(() => {
    const id = setInterval(async () => {
      if (!dirty.current) return;
      dirty.current = false;
      setSaving("saving");
      const result = await saveAnswers(attempt.id, toPayload(answersRef.current));
      if (!result.ok) {
        setError(Object.values(result.errors).flat()[0]);
        router.refresh();
        return;
      }
      setSaving("saved");
    }, 2000);
    return () => clearInterval(id);
  }, [attempt.id, router]);

  useEffect(() => {
    if (!attempt.expiresAt) return;
    const id = setInterval(() => {
      const left = new Date(attempt.expiresAt).getTime() - Date.now();
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        submit();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [attempt.expiresAt]);

  useEffect(() => {
    const handleLeave = (e) => {
      if (!dirty.current) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleLeave);
    return () => window.removeEventListener("beforeunload", handleLeave);
  }, []);

  const handlePick = (question, optionId) => () => {
    dirty.current = true;
    setSaving("idle");
    setAnswers((current) => {
      const picked = current[question.id] ?? [];
      const next = question.type === "multiple" ? (picked.includes(optionId) ? picked.filter((id) => id !== optionId) : [...picked, optionId]) : [optionId];
      return { ...current, [question.id]: next };
    });
  };

  const answered = questions.filter((q) => answers[q.id]?.length).length;

  const handleSubmit = () => {
    const missing = questions.length - answered;
    if (!window.confirm(missing ? `${missing} questions are unanswered. Submit anyway?` : "Submit your answers? You cannot change them afterwards.")) return;
    submit();
  };

  const visible = one ? [questions[index]] : questions;
  const low = remaining != null && remaining < 60_000;

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-[#302C2A] bg-[#0C0C0C]/95 p-3 backdrop-blur-sm sm:p-4">
        <span className="text-sm text-white/60">
          {answered}/{questions.length} answered
        </span>
        <span className="text-xs text-white/40">{saving === "saving" ? "Saving…" : saving === "saved" ? "Saved" : ""}</span>
        {remaining != null && (
          <span className={`ml-auto flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-sm ${low ? "bg-red-500/15 text-red-300" : "bg-white/5 text-white/80"}`} aria-live="polite">
            <Clock className="size-4" /> {formatClock(remaining)}
          </span>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={`flex items-center gap-2 rounded-full bg-linear-to-b from-[#E8602E] to-[#A8401A] px-4 py-2 text-sm font-semibold disabled:opacity-60 ${remaining == null ? "ml-auto" : ""}`}
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit
        </button>
      </div>

      <FormAlert>{error}</FormAlert>

      {one && (
        <div className="flex flex-wrap gap-2" aria-label="Questions">
          {questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "step" : undefined}
              className={`grid size-9 place-items-center rounded-lg text-sm transition ${i === index ? "bg-accent text-white" : answers[q.id]?.length ? "bg-accent/20 text-accent" : "bg-white/5 text-white/60"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {visible.map((question) => {
        const number = questions.indexOf(question) + 1;
        const picked = answers[question.id] ?? [];
        return (
          <fieldset key={question.id} className="flex min-w-0 flex-col gap-4 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-4 sm:p-6">
            <legend className="sr-only">Question {number}</legend>
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-sm font-semibold text-accent">{number}</span>
              <div className="min-w-0">
                <p className="whitespace-pre-line break-words text-lg">{question.prompt}</p>
                <p className="mt-1 text-xs text-white/40">
                  {question.type === "multiple" ? "Select all that apply" : "Select one"} · {question.points} {question.points === 1 ? "point" : "points"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {question.options.map((option) => {
                const isPicked = picked.includes(option.id);
                const Icon = question.type === "multiple" ? (isPicked ? SquareCheck : Square) : isPicked ? CheckCircle2 : Circle;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role={question.type === "multiple" ? "checkbox" : "radio"}
                    aria-checked={isPicked}
                    onClick={handlePick(question, option.id)}
                    className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition sm:p-4 ${isPicked ? "border-accent bg-accent/10" : "border-[#302C2A] hover:border-white/30"}`}
                  >
                    <Icon className={`mt-0.5 size-5 shrink-0 ${isPicked ? "text-accent" : "text-white/40"}`} />
                    <span className="min-w-0 break-words">{option.text}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {one && (
        <div className="flex justify-between gap-3">
          <button type="button" onClick={() => setIndex((i) => i - 1)} disabled={index === 0} className={btn.outline}>
            <ArrowLeft className="size-4" /> Previous
          </button>
          <button type="button" onClick={() => setIndex((i) => i + 1)} disabled={index === questions.length - 1} className={btn.outline}>
            Next <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizTaker;
