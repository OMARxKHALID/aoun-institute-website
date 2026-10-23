"use client";

import { useEffect, useState } from "react";
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

const homes = { ADMIN: "/admin", TEACHER: "/admin/courses" };

const homeFor = (user) => homes[user?.role] ?? "/dashboard";

const TwoFactorStep = ({ onDone }) => {
  const [backup, setBackup] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { error: failure } = backup ? await authClient.twoFactor.verifyBackupCode({ code: code.trim() }) : await authClient.twoFactor.verifyTotp({ code: code.trim(), trustDevice: true });
    setBusy(false);
    if (failure) return setError(failure.message ?? "That code did not work");
    onDone();
  };

  const handleSwitch = () => {
    setBackup((v) => !v);
    setCode("");
    setError(null);
  };

  return (
    <form onSubmit={handleVerify} noValidate className="grid gap-5 rounded-3xl border border-[#302C2A] bg-black/60 p-6 text-left backdrop-blur-sm md:p-10">
      <p className="text-white/70">{backup ? "Enter one of your backup codes." : "Enter the 6-digit code from your authenticator app."}</p>
      <FormAlert>{error}</FormAlert>
      <Field label={backup ? "Backup code" : "Code"} name="two-factor-code" inputMode={backup ? "text" : "numeric"} autoComplete="one-time-code" autoFocus value={code} onChange={(e) => setCode(e.target.value)} />
      <button type="button" onClick={handleSwitch} className="-mt-2 justify-self-end text-sm text-white/70 hover:text-accent">
        {backup ? "Use the authenticator app" : "Use a backup code"}
      </button>
      <Button size="lg" type="submit" loading={busy} disabled={!code.trim()}>
        Verify
      </Button>
    </form>
  );
};

const LoginForm = () => {
  const router = useRouter();
  const requested = safeNext(useSearchParams().get("next"));
  const next = requested ?? "/login";
  const { data: session } = authClient.useSession();
  const [unverified, setUnverified] = useState(null);
  const [resent, setResent] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const { register, handleSubmit, setError, formState } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (session?.user) router.replace(requested ?? homeFor(session.user));
  }, [session, requested, router]);

  const handleLogin = async (values) => {
    setUnverified(null);
    const { data, error } = await authClient.signIn.email(values);
    if (data?.twoFactorRedirect) return setTwoFactor(true);
    if (!error) return window.location.assign(requested ?? homeFor(data?.user));
    if (error.code === "EMAIL_NOT_VERIFIED") return setUnverified(values.email);
    setError("root", { message: error.message ?? "Invalid email or password" });
  };

  const handleResend = async () => {
    await authClient.sendVerificationEmail({ email: unverified, callbackURL: next });
    setResent(true);
  };

  const handleTwoFactorDone = async () => {
    const { data } = await authClient.getSession();
    window.location.assign(requested ?? homeFor(data?.user));
  };

  if (twoFactor) return <TwoFactorStep onDone={handleTwoFactorDone} />;

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
      <Link href="/forgot-password" className="-mt-2 justify-self-end text-sm text-white/70 hover:text-accent">
        Forgot password?
      </Link>
      <Button size="lg" type="submit" loading={formState.isSubmitting}>
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
