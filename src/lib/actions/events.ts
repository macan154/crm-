"use server";

import { prisma } from "@/lib/prisma";
import { requireWriter } from "@/lib/session";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { setCurrentEventId } from "@/lib/current-event";
import type { EventStatus, Prisma } from "@prisma/client";

export type CustomField = { id: string; name: string; type: "text" | "number" | "bool" | "file" };

export async function upsertEvent(formData: FormData) {
  const user = await requireWriter();
  const id = String(formData.get("id") ?? "");
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    startsAt: new Date(String(formData.get("startsAt"))),
    endsAt: formData.get("endsAt") ? new Date(String(formData.get("endsAt"))) : null,
    location: String(formData.get("location") ?? "") || null,
    status: (String(formData.get("status") ?? "ACTIVE") as EventStatus) || "ACTIVE",
  };
  if (!data.name) throw new Error("Название обязательно");
  const saved = id
    ? await prisma.event.update({ where: { id }, data })
    : await prisma.event.create({ data });
  await audit(user.id, id ? "update" : "create", "Event", saved.id, undefined, data as unknown as Prisma.InputJsonValue);
  revalidatePath("/events");
  revalidatePath("/calendar");
}

export async function chooseEvent(id: string) {
  await requireWriter().catch(async () => {
    // viewers can switch the viewed event too
  });
  await setCurrentEventId(id);
  revalidatePath("/");
}

export async function saveCustomFields(eventId: string, fields: CustomField[]) {
  const user = await requireWriter();
  await prisma.event.update({ where: { id: eventId }, data: { customFields: fields } });
  await audit(user.id, "update", "Event", eventId, undefined, fields as unknown as Prisma.InputJsonValue);
  revalidatePath("/sponsors");
}

export async function softDeleteEvent(id: string) {
  const user = await requireWriter();
  await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit(user.id, "delete", "Event", id);
  revalidatePath("/events");
}
