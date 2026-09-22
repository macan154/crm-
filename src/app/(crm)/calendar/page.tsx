import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, WriteGate } from "@/components/page-header";
import { upsertEvent } from "@/lib/actions/events";
import { formatDate } from "@/lib/utils";

export default async function CalendarPage() {
  const user = await requireUser();
  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { sponsorships: true, tasks: true } } },
    orderBy: { startsAt: "asc" },
  });
  return (
    <div>
      <PageHeader title="Календарь мероприятий" hint="Спонсоры и задачи привязаны к датам" />
      <WriteGate role={user.role}>
        <form action={upsertEvent} className="mb-6 grid gap-2 rounded-2xl border border-[#2c2c32] bg-[#141416] p-4 md:grid-cols-4">
          <input name="name" placeholder="Название" required />
          <input type="datetime-local" name="startsAt" required />
          <input type="datetime-local" name="endsAt" />
          <input name="location" placeholder="Площадка" />
          <button className="rounded-full bg-[#D5FF49] text-black">Создать</button>
        </form>
      </WriteGate>
      <div className="grid gap-3 md:grid-cols-2">
        {events.map((event) => (
          <article key={event.id} className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
            <p className="text-xs text-[#B477ED]">{formatDate(event.startsAt)}</p>
            <h2 className="text-xl">{event.name}</h2>
            <p className="text-sm text-[#FFDDBB]">{event.location}</p>
            <p className="mt-2 text-sm">Спонсоров: {event._count.sponsorships} · задач: {event._count.tasks}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
