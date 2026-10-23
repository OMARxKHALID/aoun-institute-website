const MiniCalendar = ({ marked = [], today = new Date() }) => {
  const year = today.getFullYear();
  const month = today.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const marks = new Set(marked);
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const key = (day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium">{today.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="py-1 text-white/50">
            {d}
          </span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={`grid aspect-square place-items-center rounded-lg ${!day ? "" : day === today.getDate() ? "bg-accent font-semibold text-white" : marks.has(key(day)) ? "bg-accent/20 text-accent" : "text-white/70"}`}
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MiniCalendar;
