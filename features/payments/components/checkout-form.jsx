"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createManualOrder, enrollFree } from "@/features/payments/actions";
import { checkoutSchema } from "@/features/payments/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import ImageUpload from "@/components/ui/image-upload";

const BANK = "Bank transfer";

const Detail = ({ label, value }) =>
  value ? (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2">
      <dt className="text-white/50">{label}</dt>
      <dd className="select-all font-medium">{value}</dd>
    </div>
  ) : null;

export const FreeEnrollButton = ({ courseId }) => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleEnroll = async () => {
    setBusy(true);
    const result = await enrollFree(courseId);
    setBusy(false);
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    router.push("/dashboard/courses");
  };

  return (
    <div className="flex flex-col gap-3">
      <FormAlert>{error}</FormAlert>
      <Button size="lg" type="button" loading={busy} onClick={handleEnroll} className="self-start">
        Enroll for free
      </Button>
    </div>
  );
};

const CheckoutForm = ({ courseId, payment }) => {
  const router = useRouter();
  const bank = payment.bank ?? {};
  const methods = [...(bank.accountNumber || bank.iban ? [BANK] : []), ...payment.wallets.map((w) => w.name)];
  const { register, control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { method: methods[0] ?? "", reference: "", receipt: null, note: "" },
  });
  const { errors, isSubmitting } = formState;
  const method = useWatch({ control, name: "method" });
  const wallet = payment.wallets.find((w) => w.name === method);

  const handleSave = async (values) => {
    const result = await createManualOrder(courseId, values);
    if (!result.ok) return Object.entries(result.errors).forEach(([field, messages]) => setError(field, { message: messages[0] }));
    router.refresh();
  };

  if (!methods.length) return <FormAlert>Payment details are not set up yet. Please contact us to enroll.</FormAlert>;

  return (
    <form onSubmit={handleSubmit(handleSave)} noValidate className="flex flex-col gap-6">
      <FormAlert>{errors.root?.message}</FormAlert>

      <div className="flex flex-col gap-3">
        <p className="text-base text-white/70">1. Choose how you will pay</p>
        <div className="flex flex-wrap gap-2">
          {methods.map((m) => (
            <label key={m} className="cursor-pointer rounded-full border border-[#302C2A] px-4 py-2 transition has-checked:border-accent has-checked:bg-[#4B1E0E]">
              <input type="radio" value={m} className="sr-only" {...register("method")} />
              {m}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-base text-white/70">2. Send the exact amount to</p>
        <dl className="divide-y divide-white/5 rounded-2xl border border-[#302C2A] bg-[#0C0C0C] px-5 py-2">
          {method === BANK ? (
            <>
              <Detail label="Bank" value={bank.bankName} />
              <Detail label="Account title" value={bank.accountTitle} />
              <Detail label="Account number" value={bank.accountNumber} />
              <Detail label="IBAN" value={bank.iban} />
            </>
          ) : (
            <>
              <Detail label="Wallet" value={wallet?.name} />
              <Detail label="Account title" value={wallet?.accountTitle} />
              <Detail label="Number" value={wallet?.number} />
            </>
          )}
        </dl>
        {payment.instructions && <p className="text-sm text-white/50">{payment.instructions}</p>}
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-base text-white/70">3. Tell us about your payment</p>
        <Field label="Transaction ID / reference" autoComplete="off" error={errors.reference?.message} {...register("reference")} />
        <Controller control={control} name="receipt" render={({ field }) => <ImageUpload kind="receipt" label="Receipt screenshot (recommended)" value={field.value} onChange={field.onChange} />} />
        {errors.receipt?.message && <p className="text-sm text-red-400">{errors.receipt.message}</p>}
        <Field label="Note (optional)" rows={2} error={errors.note?.message} {...register("note")} />
      </div>

      <Button size="lg" type="submit" loading={isSubmitting} className="self-start">
        Submit payment for review
      </Button>
    </form>
  );
};

export default CheckoutForm;
