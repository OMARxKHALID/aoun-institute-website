import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const from = process.env.EMAIL_FROM ?? "Aoun Institute <onboarding@resend.dev>";

export const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.log(`\n[email] to=${to}\n[email] subject=${subject}\n[email] ${html.replace(/<[^>]+>/g, " ")}\n`);
    return;
  }
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(`Email failed: ${error.message}`);
};

export const sendEmails = async (messages) => {
  if (!messages.length) return 0;
  if (!resend) {
    messages.forEach((m) => console.log(`\n[email] to=${m.to}\n[email] subject=${m.subject}\n`));
    return messages.length;
  }
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100).map((m) => ({ from, ...m }));
    const { error } = await resend.batch.send(chunk);
    if (error) console.error("[email] batch failed", error.message);
    else sent += chunk.length;
  }
  return sent;
};

export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const linkEmail = ({ title, text, url, cta }) =>
  `<div style="font-family:sans-serif;max-width:480px"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p><p><a href="${url}" style="background:#E8602E;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none">${cta}</a></p><p style="color:#888;font-size:12px">${url}</p></div>`;
