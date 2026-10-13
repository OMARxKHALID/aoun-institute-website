import { z } from "zod";

export const CONTACT_TOPICS = ["Enrollment", "Payments & refunds", "Course content", "Certificates", "Other"];

export const contactSchema = z.strictObject({
  name: z.string().trim().min(2, { error: "Enter your name" }).max(80),
  email: z.email({ error: "Enter a valid email" }),
  phone: z.string().trim().max(20).regex(/^[0-9+\s-]*$/, { error: "Digits only" }).optional().or(z.literal("")),
  topic: z.enum(CONTACT_TOPICS, { error: "Pick a topic" }),
  message: z.string().trim().min(10, { error: "Tell us a bit more (10+ characters)" }).max(2000),
});
