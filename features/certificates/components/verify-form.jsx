"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { buttonClass, searchLgClass } from "@/lib/ui";

const VerifyForm = ({ initial = "" }) => {
  const router = useRouter();
  const [code, setCode] = useState(initial);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    if (value) router.push(`/verify/${encodeURIComponent(value)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Certificate ID</span>
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-white/50" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="INST-2026-XXXXXXXX"
          autoCapitalize="characters"
          className={`${searchLgClass} uppercase placeholder:normal-case`}
        />
      </label>
      <button className={buttonClass("primary", "lg")}>Verify</button>
    </form>
  );
};

export default VerifyForm;
