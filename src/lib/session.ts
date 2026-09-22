import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/domain/permissions";
import { canManageSettings, canManageUsers, canWrite } from "@/lib/domain/permissions";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.deletedAt) redirect("/login");
  return { ...user, role: user.role as Role };
}

export async function requireWriter() {
  const user = await requireUser();
  if (!canWrite(user.role)) throw new Error("Недостаточно прав");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!canManageUsers(user.role) || !canManageSettings(user.role)) throw new Error("Только руководитель");
  return user;
}
