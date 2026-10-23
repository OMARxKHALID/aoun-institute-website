import { Megaphone } from "lucide-react";
import PanelCard from "@/components/ui/panel-card";
import { formatDate } from "@/lib/format";

const AnnouncementList = ({ announcements, showCourse }) =>
  announcements.length ? (
    <PanelCard title="Announcements">
      <ul className="flex flex-col gap-3">
        {announcements.map((a) => (
          <li key={a.id} className="flex gap-3 rounded-2xl border border-white/5 bg-[#070707] p-3">
            <Megaphone className="mt-0.5 size-5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="font-medium">{a.title}</p>
              <p className="mt-1 whitespace-pre-line break-words text-sm text-white/70">{a.body}</p>
              <p className="mt-1 text-xs text-white/50">
                {showCourse && a.course ? `${a.course} · ` : ""}
                {formatDate(a.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </PanelCard>
  ) : null;

export default AnnouncementList;
