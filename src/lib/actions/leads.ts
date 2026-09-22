"use server";

import { prisma } from "@/lib/prisma";
import { requireWriter } from "@/lib/session";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { getCurrentEventId } from "@/lib/current-event";
import { TASK_CHAIN } from "@/lib/domain/tasks";
import { sponsorshipTotal } from "@/lib/domain/money";
import type { LeadStatus, Prisma, SponsorCategory } from "@prisma/client";

export async function upsertLead(formData: FormData) {
  const user = await requireWriter();
  const id = String(formData.get("id") ?? "");
  const brand = String(formData.get("brand") ?? "").trim();
  if (!brand) throw new Error("Укажите бренд");
  const status = (String(formData.get("status") ?? "NO_REPLY") as LeadStatus) || "NO_REPLY";
  const category = (String(formData.get("category") ?? "OTHER") as SponsorCategory) || "OTHER";
  const product = String(formData.get("product") ?? "") || null;
  const links = String(formData.get("links") ?? "") || null;
  const comment = String(formData.get("comment") ?? "") || null;
  const ownerId = String(formData.get("ownerId") ?? "") || user.id;
  const rowColor = String(formData.get("rowColor") ?? "") || null;

  let contactId = String(formData.get("contactId") ?? "");
  if (!contactId) {
    const contact = await prisma.contact.create({
      data: { brand, category, notes: links },
    });
    contactId = contact.id;
  } else {
    await prisma.contact.update({
      where: { id: contactId },
      data: { brand, category },
    });
  }

  const data = {
    contactId,
    ownerId,
    category,
    product,
    brand,
    links,
    status,
    comment,
    lastContactAt: new Date(),
    rowColor,
  };

  const previous = id ? await prisma.pipelineLead.findUnique({ where: { id } }) : null;
  const saved = id
    ? await prisma.pipelineLead.update({ where: { id }, data })
    : await prisma.pipelineLead.create({ data });

  if (status === "AGREED" && previous?.status !== "AGREED") {
    await convertLead(saved.id);
  }

  await audit(user.id, id ? "update" : "create", "PipelineLead", saved.id, undefined, data as Prisma.InputJsonValue);
  revalidatePath("/pipeline");
}

export async function bulkLeadStatus(ids: string[], status: LeadStatus) {
  const user = await requireWriter();
  for (const id of ids) {
    const previous = await prisma.pipelineLead.findUnique({ where: { id } });
    await prisma.pipelineLead.update({
      where: { id },
      data: { status, lastContactAt: new Date() },
    });
    if (status === "AGREED" && previous?.status !== "AGREED") await convertLead(id);
    await audit(user.id, "status", "PipelineLead", id, { status: previous?.status }, { status });
  }
  revalidatePath("/pipeline");
  revalidatePath("/sponsors");
  revalidatePath("/tasks");
}

export async function convertLead(leadId: string) {
  const user = await requireWriter();
  const lead = await prisma.pipelineLead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Лид не найден");
  const eventId = await getCurrentEventId();
  if (!eventId) throw new Error("Сначала создайте мероприятие");
  const existing = await prisma.sponsorship.findUnique({ where: { leadId } });
  if (existing) return existing.id;

  const total = sponsorshipTotal(0, 1);
  const sponsorship = await prisma.sponsorship.create({
    data: {
      eventId,
      contactId: lead.contactId,
      leadId: lead.id,
      finderId: lead.ownerId,
      category: lead.category,
      product: lead.product,
      brand: lead.brand,
      links: lead.links,
      unitPrice: 0,
      quantity: 1,
      total,
    },
  });
  await prisma.task.createMany({
    data: TASK_CHAIN.map((step) => ({
      sponsorshipId: sponsorship.id,
      eventId,
      assigneeId: lead.ownerId,
      stage: step.stage,
      title: step.title,
      sortOrder: step.sortOrder,
    })),
  });
  await prisma.pipelineLead.update({ where: { id: leadId }, data: { status: "AGREED" } });
  await audit(user.id, "convert", "Sponsorship", sponsorship.id);
  revalidatePath("/sponsors");
  revalidatePath("/tasks");
  return sponsorship.id;
}

export async function softDeleteLead(id: string) {
  const user = await requireWriter();
  await prisma.pipelineLead.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit(user.id, "delete", "PipelineLead", id);
  revalidatePath("/pipeline");
}
