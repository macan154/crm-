import { prisma } from "@/lib/prisma";
import { getCurrentEventId } from "@/lib/current-event";
import { GlobalSearch } from "@/components/global-search";
import { EventSwitcher } from "@/components/event-switcher";

export async function Topbar() {
  const events = await prisma.event.findMany({ where: { deletedAt: null }, orderBy: { startsAt: "desc" } });
  const current = await getCurrentEventId();
  const due = await prisma.reminder.count({ where: { sentAt: null, dueAt: { lte: new Date() } } });
  return (
    <header className="flex flex-col gap-3 border-b border-[#2c2c32] bg-[#0e0e11]/80 px-4 py-3 md:flex-row md:items-center">
      <EventSwitcher events={events.map((e) => ({ id: e.id, name: e.name }))} current={current} />
      <GlobalSearch />
      <a href="/reminders" className="rounded-full bg-[#B477ED] px-3 py-2 text-sm text-black">
        Напоминания {due ? `(${due})` : ""}
      </a>
    </header>
  );
}
