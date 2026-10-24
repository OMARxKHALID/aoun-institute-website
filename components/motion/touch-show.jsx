"use client";

import { useEffect } from "react";

const TouchShow = () => {
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(({ target, isIntersecting }) => target.toggleAttribute("data-inview", isIntersecting)),
      { rootMargin: "-30% -15% -30% -15%" },
    );
    const scan = () => document.querySelectorAll("[data-show]").forEach((el) => observer.observe(el));
    const mutations = new MutationObserver(scan);
    scan();
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
};

export default TouchShow;
