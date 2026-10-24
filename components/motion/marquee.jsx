"use client";

import { useRef, useState } from "react";

const Marquee = ({ children, reverse, className = "", pauseOnHover }) => {
  const [paused, setPaused] = useState(false);
  const start = useRef(null);

  const handleTouchStart = (e) => {
    const { clientX, clientY } = e.touches[0];
    start.current = { x: clientX, y: clientY };
  };

  const handleTouchEnd = (e) => {
    if (!pauseOnHover || !start.current) return;
    const { clientX, clientY } = e.changedTouches[0];
    const moved = Math.hypot(clientX - start.current.x, clientY - start.current.y);
    start.current = null;
    if (moved > 10) return;
    setPaused((p) => !p);
  };

  return (
    <div className="w-full overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
