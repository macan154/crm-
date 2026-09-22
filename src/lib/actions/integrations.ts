"use server";

import { prisma } from "@/lib/prisma";
import { requireWriter } from "@/lib/session";
import { publishVkPost } from "@/lib/vk";
import { sendTelegram } from "@/lib/telegram";
import { renderTemplate } from "@/lib/domain/templates";
import { parseContactsExcel } from "@/lib/import-contacts";
import { revalidatePath } from "next/cache";
import type { SponsorCategory } from "@prisma/client";

export async function postSponsorshipToVk(sponsorshipId: string, templateBody: string) {
  await requireWriter();
  const item = await prisma.sponsorship.findUnique({
    where: { id: sponsorshipId },
    include: { event: true, contact: true },
  });
  if (!item) throw new Error("Не найдено");
  const message = renderTemplate(templateBody, {
    brand: item.brand,
    product: item.product,
    event: item.event.name,
    guest: item.guestName,
  });
  const result = await publishVkPost({ message });
  if (result.ok && result.url) {
    await prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: { vkPostStatus: "PUBLISHED", vkPostUrl: result.url },
    });
    await prisma.task.updateMany({
      where: { sponsorshipId, stage: "POST_PUBLISHED" },
      data: { done: true },
    });
  }
  revalidatePath("/sponsors");
  revalidatePath("/reports");
  return result;
}

export async function sendReadyTextToTelegram(telegramId: string, text: string) {
  await requireWriter();
  return sendTelegram(telegramId, text);
}

export async function importContactsFile(formData: FormData) {
  await requireWriter();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Нет файла");
  const rows = await parseContactsExcel(await file.arrayBuffer());
  for (const row of rows) {
    await prisma.contact.create({
      data: {
        brand: row.brand,
        personName: row.personName,
        position: row.position,
        category: (row.category as SponsorCategory) || "OTHER",
        vk: row.vk,
        telegram: row.telegram,
        whatsapp: row.whatsapp,
        email: row.email,
        phone: row.phone,
        notes: row.notes,
      },
    });
  }
  revalidatePath("/contacts");
}

export async function addComment(entity: "contact" | "sponsorship", id: string, body: string) {
  const user = await requireWriter();
  await prisma.comment.create({
    data: {
      body,
      userId: user.id,
      contactId: entity === "contact" ? id : null,
      sponsorshipId: entity === "sponsorship" ? id : null,
    },
  });
  revalidatePath("/contacts");
  revalidatePath("/sponsors");
}
