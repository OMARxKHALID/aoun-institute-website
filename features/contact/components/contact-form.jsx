"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendContactMessage } from "@/features/contact/actions";
import { CONTACT_TOPICS, contactSchema } from "@/features/contact/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";

const ContactForm = ({ defaults, embedded }) => {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, setError, formState } = useForm({ resolver: zodResolver(contactSchema), defaultValues: defaults });
  const { errors, isSubmitting } = formState;

  const handleSend = async (values) => {
    const result = await sendContactMessage(values);
    if (result.ok) return setSent(true);
    Object.entries(result.errors).forEach(([field, messages]) => setError(field, { message: messages[0] }));
  };

  if (sent) return <FormAlert type="success">Message sent. Our team usually replies within a few hours.</FormAlert>;

  return (
    <form onSubmit={handleSubmit(handleSend)} noValidate className={embedded ? "grid gap-4 md:grid-cols-2" : "grid gap-5 rounded-3xl border border-[#302C2A] bg-black/60 p-6 backdrop-blur-sm md:grid-cols-2 md:p-10"}>
      <div className="md:col-span-2">
        <FormAlert>{errors.root?.message}</FormAlert>
      </div>
      <Field label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <Field label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Field label="Phone (optional)" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
      <Field label="Topic" options={CONTACT_TOPICS} error={errors.topic?.message} {...register("topic")} />
      <Field label="How can we help?" rows={5} className="md:col-span-2" error={errors.message?.message} {...register("message")} />
      <Button type="submit" size={embedded ? "md" : "lg"} loading={isSubmitting} className={embedded ? "self-start md:col-span-2 md:justify-self-start" : "md:col-span-2"}>
        Send Message
      </Button>
    </form>
  );
};

export default ContactForm;
