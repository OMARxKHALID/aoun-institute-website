const StatCard = ({ icon: Icon, label, value, hint }) => (
  <div className="flex min-w-0 flex-col items-start gap-3 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent sm:size-12">
      <Icon className="size-5 sm:size-6" />
    </span>
    <div className="min-w-0 max-w-full">
      <p className="truncate font-machina text-xl leading-tight sm:text-2xl">{value}</p>
      <p className="text-sm leading-snug text-white/50">{label}</p>
      {hint && <p className="truncate text-xs text-white/50">{hint}</p>}
    </div>
  </div>
);

export default StatCard;
