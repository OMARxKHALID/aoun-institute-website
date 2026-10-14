import { NotebookPen } from "lucide-react";
import { getAllNotes } from "@/features/notes/queries";
import PanelHeader from "@/components/ui/panel-header";
import EmptyState from "@/components/ui/empty-state";
import { plural } from "@/lib/format";
import NotesList from "@/features/notes/components/notes-list";

export const metadata = { title: "My Notes" };

const NotesPage = async () => {
  const notes = await getAllNotes();
  return (
    <>
      <PanelHeader title="My notes" subtitle={`${plural(notes.length, "note")} across your lessons`} />
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-8">
        {notes.length ? (
          <NotesList notes={notes} />
        ) : (
          <EmptyState boxed icon={NotebookPen} title="No notes yet" text="While watching a lesson, write a note and it is saved at that moment of the video. Click it later to jump straight back." action={{ href: "/dashboard/courses", label: "Go to my courses" }} />
        )}
      </div>
    </>
  );
};

export default NotesPage;
