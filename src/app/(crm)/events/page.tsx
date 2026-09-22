import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, WriteGate } from "@/components/page-header";
import { upsertEvent, softDeleteEvent } from "@/lib/actions/events";
import { formatDate } from "@/lib/utils";

export default async function EventsPage() {
  const user = await requireUser();
  const events = await prisma.event.findMany({ where: { deletedAt: null }, orderBy: { startsAt: "desc" } });
  return (
    <div>
      <PageHeader title="Мероприятия" />
      <WriteGate role={user.role}>
        <form action={upsertEvent} className="mb-6 grid gap-2 rounded-2xl border border-[#2c2c32] bg-[#141416] p-4 md:grid-cols-4">
          <input name="name" placeholder="Название" required />
          <input type="datetime-local" name="startsAt" required />
          <input name="location" placeholder="Площадка" />
          <select name="status" defaultValue="ACTIVE">
            <option value="DRAFT">черновик</option>
            <option value="ACTIVE">активно</option>
            <option value="DONE">завершено</option>
          </select>
          <button className="rounded-full bg-[#FF7F3B] text-black">Сохранить</button>
        </form>
      </WriteGate>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Название</th>
              <th>Дата</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{formatDate(e.startsAt)}</td>
                <td>{e.status}</td>
                <td>
                  {user.role !== "VIEWER" ? (
                    <form action={async () => { "use server"; await softDeleteEvent(e.id); }}>
                      <button className="text-[#FF5A5A]">удалить</button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
