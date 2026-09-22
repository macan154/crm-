import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentEventId() {
  const jar = await cookies();
  const fromCookie = jar.get("current-event")?.value;
  if (fromCookie) return fromCookie;
  const settings = await prisma.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  if (settings.currentEventId) return settings.currentEventId;
  const latest = await prisma.event.findFirst({
    where: { deletedAt: null },
    orderBy: { startsAt: "desc" },
  });
  return latest?.id ?? null;
}

export async function setCurrentEventId(id: string) {
  const jar = await cookies();
  jar.set("current-event", id, { path: "/" });
  await prisma.appSettings.upsert({
    where: { id: "default" },
    update: { currentEventId: id },
    create: { id: "default", currentEventId: id },
  });
}
