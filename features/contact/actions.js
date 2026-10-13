"use server";

import { connectDB } from "@/lib/db";
import { parse, fail } from "@/lib/validate";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import ContactMessage from "@/features/contact/model";
import { contactSchema } from "@/features/contact/schemas";
import { getSiteSettings } from "@/features/site-settings/queries";

const escape = (value = "") => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const sendContactMessage = async (input) => {
  const result = parse(contactSchema, input);
  if (!result.ok) return result;
  const ip = await clientIp();
  if (!(await rateLimit("contact", ip))) return fail("Too many messages. Try again in a few minutes.");
  await connectDB();
  const { name, email, phone, topic, message } = result.data;
  await ContactMessage.create({ name, email, phone, topic, message, ip });
  const { contact } = await getSiteSettings();
  if (contact.email) {
    await sendEmail({
      to: contact.email,
      subject: `New message: ${topic}`,
      html: `<p><b>${escape(name)}</b> (${escape(email)} ${escape(phone)})</p><p>${escape(message).replace(/\n/g, "<br>")}</p>`,
    }).catch((error) => console.error(error));
  }
  return { ok: true };
};
