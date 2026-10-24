"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Button from "@/components/ui/button";
import { searchLgClass } from "@/lib/ui";

const VerifyForm = ({ initial = "" }) => {
  const router = useRouter();
  const [code, setCode] = useState(initial);
  const [pending, startTransition] = useTransition();

  const handleChange = (e) => setCode(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value) return;
    startTransition(() => router.push(`/verify/${encodeURIComponent(value)}`));
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Certificate ID</span>
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-white/50" />
        <input
          value={code}
          onChange={handleChange}
          required
          placeholder="INST-2026-XXXXXXXX"
          autoCapitalize="characters"
          className={`${searchLgClass} uppercase placeholder:normal-case`}
        />
      </label>
      <Button type="submit" size="lg" loading={pending}>
        Verify
      </Button>
    </form>
  );
};

export default VerifyForm;
