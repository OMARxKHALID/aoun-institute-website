const Marquee = ({ children, reverse, className = "", pauseOnHover }) => (
  <div className="w-full overflow-hidden">
    <div
      className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"} ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""} ${className}`}
    >
      {children}
      {children}
    </div>
  </div>
);

export default Marquee;
