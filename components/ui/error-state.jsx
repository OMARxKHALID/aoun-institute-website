"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { btn } from "@/lib/ui";

const ErrorState = ({ retry, home = "/", homeLabel = "Go home", className = "" }) => (
  <div role="alert" className={`flex flex-col items-center justify-center gap-4 px-6 py-20 text-center ${className}`}>
    <span className="grid size-14 place-items-center rounded-2xl bg-accent/15 text-accent">
      <TriangleAlert className="size-7" />
    </span>
    <h1 className="font-machina text-2xl sm:text-3xl">Something went wrong</h1>
    <p className="max-w-md text-white/60">This page could not load. Please try again. If it keeps happening, contact us and we will sort it out.</p>
    <div className="flex flex-wrap justify-center gap-3">
      <button type="button" onClick={() => retry()} className={btn.primary}>
        <RotateCcw className="size-4" /> Try again
      </button>
      <Link href={home} className={btn.outline}>
        {homeLabel}
      </Link>
    </div>
  </div>
);

export default ErrorState;
