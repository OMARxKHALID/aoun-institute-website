const BarChart = ({ data, format = (v) => v, label }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  const dense = data.length > 8;
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  return (
    <div role="img" aria-label={label} className={`flex h-44 items-end ${dense ? "gap-1 sm:gap-2" : "gap-2 sm:gap-3"}`}>
      {data.map((d, i) => (
        <div key={d.key ?? d.label} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
          <span className={`whitespace-nowrap text-[10px] sm:text-xs ${i === peak && d.value ? "text-accent" : "text-white/0 group-hover:text-white/60"}`}>{format(d.value)}</span>
          <div
            style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            className={`w-full max-w-10 rounded-xl transition-all ${i === peak && d.value ? "bg-linear-to-b from-[#E8602E] to-[#A8401A] shadow-[0_0_20px_rgba(232,96,46,0.35)]" : "bg-white/10 group-hover:bg-white/20"}`}
          />
          <span className={`w-full truncate text-center text-[10px] leading-tight text-white/45 sm:text-xs ${dense && i % 2 ? "max-sm:invisible" : ""}`}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
