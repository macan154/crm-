"use server";

import { prisma } from "@/lib/prisma";
import { requireWriter } from "@/lib/session";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type { Prisma, SponsorCategory } from "@prisma/client";

export async function upsertContact(formData: FormData) {
  const user = await requireWriter();
  const id = String(formData.get("id") ?? "");
  const data = {
    brand: String(formData.get("brand") ?? "").trim(),
    personName: String(formData.get("personName") ?? "") || null,
    position: String(formData.get("position") ?? "") || null,
    category: (String(formData.get("category") ?? "OTHER") as SponsorCategory) || "OTHER",
    vk: String(formData.get("vk") ?? "") || null,
    telegram: String(formData.get("telegram") ?? "") || null,
    whatsapp: String(formData.get("whatsapp") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
  };
  if (!data.brand) throw new Error("Укажите бренд");
  const saved = id
    ? await prisma.contact.update({ where: { id }, data })
    : await prisma.contact.create({ data });
  await audit(user.id, id ? "update" : "create", "Contact", saved.id, undefined, data as Prisma.InputJsonValue);
  revalidatePath("/contacts");
}

export async function addInteraction(contactId: string, body: string) {
  const user = await requireWriter();
  await prisma.interaction.create({ data: { contactId, userId: user.id, body } });
  revalidatePath(`/contacts/${contactId}`);
}

export async function softDeleteContact(id: string) {
  const user = await requireWriter();
  await prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit(user.id, "delete", "Contact", id);
  revalidatePath("/contacts");
}
