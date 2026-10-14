"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema } from "@/features/auth/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";

const ForgotPasswordForm = () => {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const handleRequest = async ({ email }) => {
    await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setSent(true);
  };

  if (sent) return <FormAlert type="success">If an account exists for that email, a reset link is on its way.</FormAlert>;

  return (
    <form onSubmit={handleSubmit(handleRequest)} noValidate className="grid gap-5 rounded-3xl border border-[#302C2A] bg-black/60 p-6 text-left backdrop-blur-sm md:p-10">
      <Field label="Email" type="email" autoComplete="email" error={formState.errors.email?.message} {...register("email")} />
      <Button size="lg" type="submit" loading={formState.isSubmitting}>
        Send Reset Link
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
