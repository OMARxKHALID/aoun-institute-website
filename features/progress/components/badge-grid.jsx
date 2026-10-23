import { Award, BookOpen, CheckCircle2, Clock, Flame, Footprints, Lock, Medal, MessageCircleQuestion, NotebookPen, Star, Target, Trophy, Zap } from "lucide-react";

const icons = { footprints: Footprints, book: BookOpen, medal: Medal, flame: Flame, zap: Zap, check: CheckCircle2, target: Target, clock: Clock, award: Award, trophy: Trophy, notebook: NotebookPen, message: MessageCircleQuestion, star: Star };

const BadgeGrid = ({ badges }) => (
  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
    {badges.map((b) => {
      const Icon = icons[b.icon] ?? Award;
      return (
        <li
          key={b.id}
          title={b.text}
          className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${b.earned ? "border-accent/40 bg-accent/[0.07]" : "border-white/5 bg-[#070707] opacity-55"}`}
        >
          <span className={`relative grid size-12 place-items-center rounded-full ${b.earned ? "bg-linear-to-b from-[#E8602E] to-[#A8401A] text-white shadow-[0_0_20px_rgba(232,96,46,0.35)]" : "bg-white/5 text-white/50"}`}>
            <Icon className="size-6" />
            {!b.earned && <Lock className="absolute -bottom-1 -right-1 size-4 rounded-full bg-[#0C0C0C] p-0.5 text-white/50" />}
          </span>
          <span className="text-sm font-medium leading-tight">{b.label}</span>
          <span className="text-xs leading-snug text-white/50">{b.text}</span>
        </li>
      );
    })}
  </ul>
);

export default BadgeGrid;
