"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/features/auth/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";

const RegisterForm = () => {
  const [sentTo, setSentTo] = useState(null);
  const { register, handleSubmit, setError, formState } = useForm({ resolver: zodResolver(registerSchema) });

  const handleRegister = async ({ name, email, password }) => {
    const { error } = await authClient.signUp.email({ name, email, password, callbackURL: "/dashboard" });
    if (error) return setError("root", { message: error.message ?? "Could not create account" });
    setSentTo(email);
  };

  if (sentTo) {
    return (
      <FormAlert type="success">
        Account created. We sent a verification link to <b>{sentTo}</b>. Open it to start learning.
      </FormAlert>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleRegister)} noValidate className="grid gap-5 rounded-3xl border border-[#302C2A] bg-black/60 p-6 text-left backdrop-blur-sm md:p-10">
      <FormAlert>{formState.errors.root?.message}</FormAlert>
      <Field label="Full name" autoComplete="name" error={formState.errors.name?.message} {...register("name")} />
      <Field label="Email" type="email" autoComplete="email" error={formState.errors.email?.message} {...register("email")} />
      <Field label="Password" type="password" autoComplete="new-password" error={formState.errors.password?.message} {...register("password")} />
      <Field label="Confirm password" type="password" autoComplete="new-password" error={formState.errors.confirm?.message} {...register("confirm")} />
      <Button size="lg" type="submit" loading={formState.isSubmitting}>
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;
