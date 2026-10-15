"use client";

import { useEffect, useRef, useState } from "react";

const EDGE = 90;
const MAX_SPEED = 18;
const THRESHOLD = 4;

const middle = (el) => {
  const r = el.getBoundingClientRect();
  return r.top + r.height / 2;
};

const gap = (el, y) => {
  const r = el.getBoundingClientRect();
  return y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
};

const sectionTarget = (y, id) => {
  const items = [...document.querySelectorAll("[data-sort-section]")].filter((el) => el.dataset.sortSection !== id);
  return { index: items.filter((el) => middle(el) < y).length };
};

const lessonTarget = (y, id) => {
  const sections = [...document.querySelectorAll("[data-sort-section]")];
  if (!sections.length) return null;
  const section = sections.reduce((best, el) => (gap(el, y) < gap(best, y) ? el : best));
  const items = [...section.querySelectorAll("[data-sort-lesson]")].filter((el) => el.dataset.sortLesson !== id);
  const index = items.length ? items.filter((el) => middle(el) < y).length : Number(section.dataset.count ?? 0);
  return { sectionId: section.dataset.sortSection, index };
};

const scrollSpeed = (y) => {
  if (y < EDGE) return -Math.ceil(((EDGE - y) / EDGE) * MAX_SPEED);
  if (y > window.innerHeight - EDGE) return Math.ceil(((y - window.innerHeight + EDGE) / EDGE) * MAX_SPEED);
  return 0;
};

export const useSortable = (onSort) => {
  const [active, setActive] = useState(null);
  const [target, setTarget] = useState(null);
  const sortRef = useRef(onSort);

  useEffect(() => {
    sortRef.current = onSort;
  });

  const start = (type, id) => (e) => {
    if (e.button !== 0) return;
    const node = e.currentTarget.closest(type === "section" ? "[data-sort-section]" : "[data-sort-lesson]");
    if (!node) return;
    e.preventDefault();
    const origin = { y: e.clientY, scroll: window.scrollY };
    const pointer = { y: e.clientY };
    let moved = false;
    let last = null;
    let frame = 0;

    const tick = () => {
      if (!moved && Math.abs(pointer.y - origin.y) > THRESHOLD) {
        moved = true;
        setActive({ type, id });
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
      }
      if (moved) {
        const speed = scrollSpeed(pointer.y);
        if (speed) window.scrollBy(0, speed);
        node.style.transform = `translate3d(0, ${pointer.y - origin.y + window.scrollY - origin.scroll}px, 0)`;
        const next = type === "section" ? sectionTarget(pointer.y, id) : lessonTarget(pointer.y, id);
        if (JSON.stringify(next) !== JSON.stringify(last)) {
          last = next;
          setTarget(next);
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const handleMove = (ev) => {
      pointer.y = ev.clientY;
    };

    const finish = (commit) => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
      window.removeEventListener("keydown", handleKey);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      node.style.transition = commit ? "" : "transform 180ms ease-out";
      node.style.transform = "";
      setTimeout(() => {
        node.style.transition = "";
      }, 200);
      setActive(null);
      setTarget(null);
      if (commit && moved && last) sortRef.current({ type, id }, last);
    };

    const handleUp = () => finish(true);
    const handleCancel = () => finish(false);
    const handleKey = (ev) => ev.key === "Escape" && finish(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleCancel);
    window.addEventListener("keydown", handleKey);
    frame = requestAnimationFrame(tick);
  };

  return { active, target, start };
};
