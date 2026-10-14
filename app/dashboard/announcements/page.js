import { Megaphone } from "lucide-react";
import { getMyAnnouncements } from "@/features/announcements/queries";
import PanelHeader from "@/components/ui/panel-header";
import EmptyState from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Announcements" };

const AnnouncementsPage = async () => {
  const announcements = await getMyAnnouncements(null, 100);
  return (
    <>
      <PanelHeader title="Announcements" subtitle="Updates from your instructors." />
      <div className="p-4 sm:p-5 lg:p-8">
        {announcements.length ? (
          <ol className="relative flex flex-col gap-4 border-l border-white/10 pl-5 sm:pl-8">
            {announcements.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[27px] top-6 size-3 rounded-full bg-accent ring-4 ring-black sm:-left-[39px]" />
                <article className="flex min-w-0 flex-col gap-2 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-4 sm:p-6">
                  <p className="text-xs text-white/40">
                    {a.course} · {formatDate(a.createdAt)}
                  </p>
                  <h2 className="font-machina text-xl">{a.title}</h2>
                  <p className="whitespace-pre-line break-words text-white/65">{a.body}</p>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState boxed icon={Megaphone} title="No announcements yet" text="When your instructors post updates for your courses, they appear here and in your email." />
        )}
      </div>
    </>
  );
};

export default AnnouncementsPage;
