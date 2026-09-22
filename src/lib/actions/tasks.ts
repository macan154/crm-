"use server";

import { prisma } from "@/lib/prisma";
import { requireWriter } from "@/lib/session";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function toggleTask(id: string, done: boolean) {
  const user = await requireWriter();
  await prisma.task.update({ where: { id }, data: { done } });
  await audit(user.id, "toggle", "Task", id, undefined, { done });
  revalidatePath("/tasks");
  revalidatePath("/sponsors");
}

export async function assignTask(id: string, assigneeId: string | null) {
  const user = await requireWriter();
  await prisma.task.update({ where: { id }, data: { assigneeId } });
  await audit(user.id, "assign", "Task", id, undefined, { assigneeId });
  revalidatePath("/tasks");
}

export async function setTaskDue(id: string, dueAt: string | null) {
  await requireWriter();
  await prisma.task.update({ where: { id }, data: { dueAt: dueAt ? new Date(dueAt) : null } });
  revalidatePath("/tasks");
}
