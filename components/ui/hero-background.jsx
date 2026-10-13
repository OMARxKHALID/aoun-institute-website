const HeroBackground = ({ className = "h-[80vh] md:h-[165vh]" }) => (
  <div className={`pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_50%_45%,rgba(232,96,46,0.35),transparent_70%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(35deg,transparent_49.8%,rgba(255,255,255,0.07)_50%,transparent_50.2%),linear-gradient(-35deg,transparent_49.8%,rgba(255,255,255,0.07)_50%,transparent_50.2%)] mask-radial-at-[50%_35%] mask-radial-from-30% mask-radial-to-75%" />
    <div className="absolute inset-x-[18%] inset-y-0 border-x border-white/5" />
    <div className="absolute left-[8%] top-[22%] size-64 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[10px_10px] mask-circle mask-radial-to-70%" />
    <div className="absolute right-[8%] top-[18%] size-72 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[10px_10px] mask-circle mask-radial-to-70%" />
    <div className="absolute inset-x-0 top-[38%] h-px bg-white/5" />
  </div>
);

export default HeroBackground;
