"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const StaggerIn = ({ children, className = "", stagger = 0.09 }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(ref.current.children, { opacity: 0, y: 24, duration: 0.8, ease: "power3.out", stagger });
    });
    return () => mm.revert();
  }, [stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default StaggerIn;
