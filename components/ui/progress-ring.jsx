const ProgressRing = ({ percent = 0, size = 48 }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="24" cy="24" r={radius} fill="none" strokeWidth="4" className="stroke-white/10" />
        <circle cx="24" cy="24" r={radius} fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} className="stroke-accent" />
      </svg>
      <span className="text-[11px] font-semibold">{percent}%</span>
    </span>
  );
};

export default ProgressRing;
