"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/features/auth/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";

const ResetPasswordForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const { register, handleSubmit, setError, formState } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const handleReset = async ({ password }) => {
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) return setError("root", { message: error.message ?? "This link is invalid or expired" });
    router.push("/login?reset=1");
  };

  if (!token || params.get("error")) {
    return (
      <FormAlert>
        This reset link is invalid or expired.{" "}
        <Link href="/forgot-password" className="underline">
          Request a new one
        </Link>
      </FormAlert>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleReset)} noValidate className="grid gap-5 rounded-3xl border border-[#302C2A] bg-black/60 p-6 text-left backdrop-blur-sm md:p-10">
      <FormAlert>{formState.errors.root?.message}</FormAlert>
      <Field label="New password" type="password" autoComplete="new-password" error={formState.errors.password?.message} {...register("password")} />
      <Field label="Confirm password" type="password" autoComplete="new-password" error={formState.errors.confirm?.message} {...register("confirm")} />
      <Button size="lg" type="submit" loading={formState.isSubmitting}>
        Save New Password
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
