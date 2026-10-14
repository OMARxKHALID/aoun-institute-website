"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, CornerDownRight, GraduationCap, MessageCircleQuestion, Trash2 } from "lucide-react";
import { askQuestion, deleteDiscussion, replyToQuestion } from "@/features/discussions/actions";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import { formatDate } from "@/lib/format";
import { useDialog } from "@/components/ui/dialog-provider";
import { inputClass } from "@/lib/ui";
import Pager from "@/components/ui/pager";
import { usePager } from "@/hooks/use-pager";

const Composer = ({ placeholder, button, onSubmit, autoFocus }) => {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await onSubmit(body);
    setBusy(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setBody("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={3000}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={placeholder}
        className={inputClass}
      />
      <FormAlert>{error}</FormAlert>
      <Button type="submit" loading={busy} disabled={body.trim().length < 3} className="self-start">
        {button}
      </Button>
    </form>
  );
};

const Author = ({ name, instructor, date }) => (
  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
    <span className="font-medium">{name}</span>
    {instructor && (
      <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
        <GraduationCap className="size-3.5" /> Instructor
      </span>
    )}
    <span className="text-xs text-white/40">{formatDate(date)}</span>
  </p>
);

const Thread = ({ thread, admin, onChange }) => {
  const dialog = useDialog();
  const [replying, setReplying] = useState(false);

  const handleReply = async (body) => {
    const result = await replyToQuestion(thread.id, { body });
    if (result.ok) {
      setReplying(false);
      onChange();
    }
    return result;
  };

  const handleDelete = (id) => async () => {
    if (!(await dialog.confirm({ title: "Delete this post?", message: "Replies under it are deleted too.", confirmLabel: "Delete", danger: true }))) return;
    await deleteDiscussion(id);
    onChange();
  };

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#070707] p-4">
      {admin && (
        <p className="text-xs text-white/45">
          <Link href={`/admin/courses/${thread.courseId}/lessons/${thread.lessonId}`} className="hover:text-accent">
            {thread.course} · {thread.lesson}
          </Link>
        </p>
      )}
      <div className="flex items-start gap-3">
        <MessageCircleQuestion className={`mt-0.5 size-5 shrink-0 ${thread.answered ? "text-green-400" : "text-accent"}`} />
        <div className="min-w-0 flex-1">
          <Author name={thread.authorName} instructor={thread.instructor} date={thread.createdAt} />
          <p className="mt-1 whitespace-pre-line break-words text-white/80">{thread.body}</p>
        </div>
        {thread.answered && (
          <span className="hidden shrink-0 items-center gap-1 text-xs text-green-300 sm:flex">
            <CheckCircle2 className="size-4" /> Answered
          </span>
        )}
        {(thread.mine || admin) && (
          <button type="button" onClick={handleDelete(thread.id)} aria-label="Delete question" className="grid size-8 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-300">
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      {thread.replies.length > 0 && (
        <ul className="ml-8 flex flex-col gap-3 border-l border-white/10 pl-4">
          {thread.replies.map((r) => (
            <li key={r.id} className={`flex items-start gap-2 rounded-xl p-2 ${r.instructor ? "bg-accent/[0.06]" : ""}`}>
              <CornerDownRight className="mt-0.5 size-4 shrink-0 text-white/30" />
              <div className="min-w-0 flex-1">
                <Author name={r.authorName} instructor={r.instructor} date={r.createdAt} />
                <p className="mt-1 whitespace-pre-line break-words text-sm text-white/75">{r.body}</p>
              </div>
              {(r.mine || admin) && (
                <button type="button" onClick={handleDelete(r.id)} aria-label="Delete reply" className="grid size-7 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-300">
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="ml-8">
        {replying ? (
          <Composer placeholder="Write a reply" button="Reply" onSubmit={handleReply} autoFocus />
        ) : (
          <button type="button" onClick={() => setReplying(true)} className="text-sm text-accent hover:underline">
            {admin ? "Answer" : "Reply"}
          </button>
        )}
      </div>
    </li>
  );
};

const DiscussionBoard = ({ lessonId, threads, admin = false }) => {
  const router = useRouter();
  const refresh = () => router.refresh();
  const { shown, pager } = usePager(threads);

  const handleAsk = async (body) => {
    const result = await askQuestion(lessonId, { body });
    if (result.ok) refresh();
    return result;
  };

  return (
    <div id="questions" className="flex scroll-mt-24 flex-col gap-4">
      {lessonId && <Composer placeholder="Stuck on something? Ask a question about this lesson" button="Ask question" onSubmit={handleAsk} />}
      {threads.length ? (
        <ul className="flex flex-col gap-3">
          {shown.map((thread) => (
            <Thread key={thread.id} thread={thread} admin={admin} onChange={refresh} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-white/45">{admin ? "No questions here." : "No questions yet. Be the first to ask."}</p>
      )}
      <Pager {...pager} />
    </div>
  );
};

export default DiscussionBoard;
