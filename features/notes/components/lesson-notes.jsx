"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Play, Trash2 } from "lucide-react";
import { addNote, deleteNote } from "@/features/notes/actions";
import { usePlayerController } from "@/features/progress/components/lesson-player";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import { formatClock } from "@/lib/format";
import { inputClass } from "@/lib/ui";
import Pager from "@/components/ui/pager";
import { usePager } from "@/hooks/use-pager";

const LessonNotes = ({ lessonId, notes, timed }) => {
  const router = useRouter();
  const controller = usePlayerController();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const { shown, pager } = usePager(notes);

  const handleAdd = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const sec = timed ? (controller?.current?.getTime() ?? 0) : 0;
    const result = await addNote(lessonId, { sec, body });
    setBusy(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setBody("");
    router.refresh();
  };

  const handleJump = (sec) => () => {
    controller?.current?.seek(sec);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => async () => {
    await deleteNote(id);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder={timed ? "Write a note. It is saved at the current video time." : "Write a note about this lesson"}
          aria-label="New note"
          className={inputClass}
        />
        <FormAlert>{error}</FormAlert>
        <Button type="submit" loading={busy} disabled={!body.trim()} className="self-start">
          <Bookmark className="size-4" /> Save note
        </Button>
      </form>
      {notes.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {shown.map((note) => (
            <li key={note.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#070707] p-3">
              {timed ? (
                <button type="button" onClick={handleJump(note.sec)} title="Jump to this moment" className="flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-xs text-accent hover:bg-accent hover:text-white">
                  <Play className="size-3" /> {formatClock(note.sec)}
                </button>
              ) : (
                <Bookmark className="mt-0.5 size-4 shrink-0 text-accent" />
              )}
              <p className="min-w-0 flex-1 whitespace-pre-line break-words text-sm text-white/70">{note.body}</p>
              <button type="button" onClick={handleDelete(note.id)} aria-label="Delete note" className="grid size-7 shrink-0 place-items-center rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-400">
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-white/50">No notes yet. Notes are private to you.</p>
      )}
      <Pager {...pager} />
    </div>
  );
};

export default LessonNotes;
