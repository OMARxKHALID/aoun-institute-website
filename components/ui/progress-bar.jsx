const ProgressBar = ({ percent = 0, className = "" }) => (
  <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className={`h-2 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
    <div style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} className="h-full rounded-full bg-linear-to-r from-[#A8401A] to-[#E8602E] transition-[width] duration-500" />
  </div>
);

export default ProgressBar;
