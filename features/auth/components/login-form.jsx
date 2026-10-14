"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/features/auth/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";

const safeNext = (next) => (next?.startsWith("/") && !next.startsWith("//") ? next : null);

const LoginForm = () => {
  const router = useRouter();
  const requested = safeNext(useSearchParams().get("next"));
  const next = requested ?? "/dashboard";
  const [unverified, setUnverified] = useState(null);
  const [resent, setResent] = useState(false);
  const { register, handleSubmit, setError, formState } = useForm({ resolver: zodResolver(loginSchema) });

  const handleLogin = async (values) => {
    setUnverified(null);
    const { data, error } = await authClient.signIn.email(values);
    if (!error) return router.push(requested ?? (data?.user?.role === "ADMIN" ? "/admin" : "/dashboard"));
    if (error.code === "EMAIL_NOT_VERIFIED") return setUnverified(values.email);
    setError("root", { message: error.message ?? "Invalid email or password" });
  };

  const handleResend = async () => {
    await authClient.sendVerificationEmail({ email: unverified, callbackURL: next });
    setResent(true);
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)} noValidate className="grid gap-5 rounded-3xl border border-[#302C2A] bg-black/60 p-6 text-left backdrop-blur-sm md:p-10">
      <FormAlert>{formState.errors.root?.message}</FormAlert>
      {unverified && (
        <FormAlert type={resent ? "success" : "error"}>
          {resent ? (
            "Verification email sent. Check your inbox."
          ) : (
            <>
              Verify your email first.{" "}
              <button type="button" onClick={handleResend} className="underline">
                Resend link
              </button>
            </>
          )}
        </FormAlert>
      )}
      <Field label="Email" type="email" autoComplete="email" error={formState.errors.email?.message} {...register("email")} />
      <Field label="Password" type="password" autoComplete="current-password" error={formState.errors.password?.message} {...register("password")} />
      <Link href="/forgot-password" className="-mt-2 justify-self-end text-sm text-white/60 hover:text-accent">
        Forgot password?
      </Link>
      <Button size="lg" type="submit" loading={formState.isSubmitting}>
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
