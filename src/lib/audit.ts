import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function audit(
  userId: string | null,
  action: string,
  entity: string,
  entityId: string,
  before?: Prisma.InputJsonValue,
  after?: Prisma.InputJsonValue,
) {
  await prisma.auditLog.create({
    data: { userId: userId ?? undefined, action, entity, entityId, before, after },
  });
}
