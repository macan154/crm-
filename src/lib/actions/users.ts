"use server";

import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import type { Role } from "@prisma/client";

export async function createInvite(formData: FormData) {
  const admin = await requireAdmin();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = (String(formData.get("role") ?? "MEMBER") as Role) || "MEMBER";
  if (!email) throw new Error("Email обязателен");
  const token = randomBytes(24).toString("hex");
  const invite = await prisma.invite.create({
    data: {
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 86400000),
      createdBy: admin.id,
    },
  });
  const url = `${process.env.AUTH_URL ?? "http://localhost:3000"}/invite/${token}`;
  await sendEmail(email, "Приглашение в CRM спонсоров СГУПС", `<p>Вас пригласили. Перейдите по ссылке: <a href="${url}">${url}</a></p>`);
  await audit(admin.id, "invite", "Invite", invite.id);
  revalidatePath("/settings");
}

export async function acceptInvite(token: string, name: string, password: string) {
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) throw new Error("Приглашение недействительно");
  const passwordHash = await hash(password, 10);
  await prisma.user.create({
    data: { name, email: invite.email, passwordHash, role: invite.role },
  });
  await prisma.invite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
}

export async function updateUserRole(userId: string, role: Role) {
  const admin = await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  await audit(admin.id, "role", "User", userId, undefined, { role });
  revalidatePath("/settings");
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  await prisma.appSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ratingWrittenCoeff: Number(formData.get("ratingWrittenCoeff") ?? 1),
      ratingPartnerCoeff: Number(formData.get("ratingPartnerCoeff") ?? 3),
      ratingSumCoeff: Number(formData.get("ratingSumCoeff") ?? 0.001),
      ratingEventCoeff: Number(formData.get("ratingEventCoeff") ?? 2),
      vkGroupId: String(formData.get("vkGroupId") ?? "") || null,
      vkToken: String(formData.get("vkToken") ?? "") || null,
      telegramBotUsername: String(formData.get("telegramBotUsername") ?? "") || null,
    },
    update: {
      ratingWrittenCoeff: Number(formData.get("ratingWrittenCoeff") ?? 1),
      ratingPartnerCoeff: Number(formData.get("ratingPartnerCoeff") ?? 3),
      ratingSumCoeff: Number(formData.get("ratingSumCoeff") ?? 0.001),
      ratingEventCoeff: Number(formData.get("ratingEventCoeff") ?? 2),
      vkGroupId: String(formData.get("vkGroupId") ?? "") || null,
      vkToken: String(formData.get("vkToken") ?? "") || null,
      telegramBotUsername: String(formData.get("telegramBotUsername") ?? "") || null,
    },
  });
  revalidatePath("/settings");
  revalidatePath("/rating");
}

export async function saveTemplate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    channel: String(formData.get("channel") ?? "telegram"),
    body: String(formData.get("body") ?? ""),
  };
  if (id) await prisma.messageTemplate.update({ where: { id }, data });
  else await prisma.messageTemplate.create({ data });
  revalidatePath("/settings");
  revalidatePath("/reports");
}
