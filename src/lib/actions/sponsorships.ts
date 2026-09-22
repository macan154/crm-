"use server";

import { prisma } from "@/lib/prisma";
import { requireWriter } from "@/lib/session";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { sponsorshipTotal } from "@/lib/domain/money";
import type { AdFormat, Prisma, SponsorCategory, VkPostStatus } from "@prisma/client";

export async function updateSponsorship(id: string, patch: Record<string, unknown>) {
  const user = await requireWriter();
  const current = await prisma.sponsorship.findUnique({ where: { id } });
  if (!current) throw new Error("Спонсор не найден");
  const unitPrice = patch.unitPrice != null ? Number(patch.unitPrice) : Number(current.unitPrice);
  const quantity = patch.quantity != null ? Number(patch.quantity) : current.quantity;
  const data: Prisma.SponsorshipUpdateInput = {
    ...("brand" in patch ? { brand: String(patch.brand) } : {}),
    ...("product" in patch ? { product: String(patch.product || "") || null } : {}),
    ...("category" in patch ? { category: patch.category as SponsorCategory } : {}),
    ...("links" in patch ? { links: String(patch.links || "") || null } : {}),
    ...("guestName" in patch ? { guestName: String(patch.guestName || "") || null } : {}),
    ...("hasLogo" in patch ? { hasLogo: Boolean(patch.hasLogo) } : {}),
    ...("hasPostText" in patch ? { hasPostText: Boolean(patch.hasPostText) } : {}),
    ...("needsTable" in patch ? { needsTable: Boolean(patch.needsTable) } : {}),
    ...("isJury" in patch ? { isJury: Boolean(patch.isJury) } : {}),
    ...("adFormat" in patch ? { adFormat: patch.adFormat as AdFormat } : {}),
    ...("vkPostStatus" in patch ? { vkPostStatus: patch.vkPostStatus as VkPostStatus } : {}),
    ...("vkPostUrl" in patch ? { vkPostUrl: String(patch.vkPostUrl || "") || null } : {}),
    ...("customValues" in patch ? { customValues: patch.customValues as Prisma.InputJsonValue } : {}),
    ...("archived" in patch ? { archived: Boolean(patch.archived) } : {}),
    unitPrice,
    quantity,
    total: sponsorshipTotal(unitPrice, quantity),
  };
  const saved = await prisma.sponsorship.update({ where: { id }, data });
  await audit(user.id, "update", "Sponsorship", id, current as unknown as Prisma.InputJsonValue, data as Prisma.InputJsonValue);
  revalidatePath("/sponsors");
  revalidatePath("/archive");
}

export async function softDeleteSponsorship(id: string) {
  const user = await requireWriter();
  await prisma.sponsorship.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit(user.id, "delete", "Sponsorship", id);
  revalidatePath("/sponsors");
}
