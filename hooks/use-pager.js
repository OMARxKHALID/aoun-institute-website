"use client";

import { useState } from "react";

export const PAGE_SIZE = 10;

export const usePager = (items, size = PAGE_SIZE) => {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(page, pages - 1);
  const start = current * size;
  return {
    shown: items.slice(start, start + size),
    pager: {
      from: items.length ? start + 1 : 0,
      to: Math.min(items.length, start + size),
      total: items.length,
      page: current,
      pages,
      onPrev: () => setPage(current - 1),
      onNext: () => setPage(current + 1),
    },
  };
};
