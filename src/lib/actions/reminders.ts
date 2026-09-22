"use server";

import { prisma } from "@/lib/prisma";
import { requireUser, requireWriter } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { ReminderRepeat, ReminderType } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { sendTelegram } from "@/lib/telegram";

export async function createReminder(formData: FormData) {
  const user = await requireWriter();
  await prisma.reminder.create({
    data: {
      type: (String(formData.get("type") ?? "CUSTOM") as ReminderType) || "CUSTOM",
      title: String(formData.get("title") ?? "").trim() || "Напоминание",
      body: String(formData.get("body") ?? "") || null,
      dueAt: new Date(String(formData.get("dueAt"))),
      repeat: (String(formData.get("repeat") ?? "NONE") as ReminderRepeat) || "NONE",
      userId: String(formData.get("userId") ?? "") || user.id,
      contactId: String(formData.get("contactId") ?? "") || null,
      leadId: String(formData.get("leadId") ?? "") || null,
      sponsorshipId: String(formData.get("sponsorshipId") ?? "") || null,
      eventId: String(formData.get("eventId") ?? "") || null,
      taskId: String(formData.get("taskId") ?? "") || null,
    },
  });
  revalidatePath("/reminders");
}

export async function dispatchDueReminders() {
  const due = await prisma.reminder.findMany({
    where: { sentAt: null, dueAt: { lte: new Date() } },
    include: { user: true },
  });
  for (const item of due) {
    const text = item.body ? `${item.title}\n${item.body}` : item.title;
    if (item.user?.email) await sendEmail(item.user.email, item.title, `<p>${text}</p>`);
    if (item.user?.telegramId) await sendTelegram(item.user.telegramId, text);
    const next =
      item.repeat === "DAILY"
        ? new Date(item.dueAt.getTime() + 86400000)
        : item.repeat === "WEEKLY"
          ? new Date(item.dueAt.getTime() + 7 * 86400000)
          : null;
    await prisma.reminder.update({
      where: { id: item.id },
      data: next ? { dueAt: next, sentAt: null } : { sentAt: new Date() },
    });
  }
  return due.length;
}

export async function saveFilter(page: string, name: string, payload: unknown) {
  const user = await requireUser();
  await prisma.savedFilter.create({
    data: { userId: user.id, page, name, payload: payload as object },
  });
  revalidatePath(`/${page}`);
}

export async function deleteFilter(id: string) {
  const user = await requireUser();
  await prisma.savedFilter.delete({ where: { id, userId: user.id } });
}
