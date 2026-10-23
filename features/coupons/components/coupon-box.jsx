"use client";

import { useState } from "react";
import { TicketPercent, X } from "lucide-react";
import { previewCoupon } from "@/features/coupons/actions";
import Button from "@/components/ui/button";
import { inputClass } from "@/lib/ui";

const CouponBox = ({ courseId, applied, onChange }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    const result = await previewCoupon(courseId, code);
    setBusy(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setError(null);
    onChange(result.data);
  };

  const handleRemove = () => {
    setCode("");
    onChange(null);
  };

  if (applied)
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-500/30 bg-green-500/5 px-4 py-3">
        <p className="flex items-center gap-2 text-sm">
          <TicketPercent className="size-4 text-green-400" />
          <span className="font-mono font-medium">{applied.code}</span>
          <span className="text-white/70">saves {applied.discountLabel}</span>
        </p>
        <button type="button" onClick={handleRemove} className="flex items-center gap-1 text-sm text-white/70 transition hover:text-white">
          <X className="size-4" /> Remove
        </button>
      </div>
    );

  return (
    <form onSubmit={handleApply} noValidate className="flex flex-col gap-2">
      <label htmlFor="coupon" className="text-sm font-medium text-white/70">
        Have a coupon code?
      </label>
      <div className="flex gap-2">
        <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. WELCOME20" autoComplete="off" aria-invalid={Boolean(error)} className={`${inputClass} font-mono uppercase placeholder:normal-case`} />
        <Button type="submit" variant="outline" loading={busy} className="shrink-0">
          Apply
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </form>
  );
};

export default CouponBox;
