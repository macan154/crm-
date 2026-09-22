import { Resend } from "resend";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.info("[email:dev]", { to, subject, html });
    return { ok: true, dev: true };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM ?? "CRM СГУПС <noreply@example.com>";
  await resend.emails.send({ from, to, subject, html });
  return { ok: true, dev: false };
}
