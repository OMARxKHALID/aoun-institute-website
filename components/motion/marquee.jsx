"use client";

import { useState } from "react";

const Marquee = ({ children, reverse, className = "", pauseOnHover }) => {
  const [paused, setPaused] = useState(false);

  const handleTouchEnd = () => {
    if (!pauseOnHover) return;
    setPaused((p) => !p);
  };

  return (
    <div className="w-full overflow-hidden" onTouchEnd={handleTouchEnd}>
      <div
        className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"} ${pauseOnHover ? "hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]" : ""} ${paused ? "[animation-play-state:paused]" : ""} ${className}`}
      >
        {children}
        {children}
      </div>
    </div>
  );
};

export default Marquee;
