"use client";

import { useRef, useState } from "react";

const rest = { transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)", transition: "transform 450ms cubic-bezier(.2,.8,.2,1)" };

const Tilt = ({ children, className = "", max = 7 }) => {
  const ref = useRef(null);
  const [style, setStyle] = useState(rest);

  const handlePointerMove = (e) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setStyle({ transform: `perspective(1000px) rotateX(${(-y * max * 0.6).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) scale(1.02)`, transition: "transform 120ms ease-out" });
  };

  const handlePointerLeave = () => setStyle(rest);

  return (
    <div ref={ref} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} style={style} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
};

export default Tilt;
