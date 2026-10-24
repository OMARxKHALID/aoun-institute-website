"use client";

import { useEffect, useState } from "react";

const MobileEnrollBar = ({ watchId, children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchId]);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-4 rounded-2xl border border-[#302C2A] bg-black/85 p-3 pl-5 backdrop-blur-xl transition-all duration-300 lg:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[150%] opacity-0"}`}
    >
      {children}
    </div>
  );
};

export default MobileEnrollBar;
