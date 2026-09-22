import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, WriteGate } from "@/components/page-header";
import { createReminder } from "@/lib/actions/reminders";
import { REMINDER_TYPE_LABELS } from "@/lib/domain/labels";
import { formatDateTime } from "@/lib/utils";

export default async function RemindersPage() {
  const user = await requireUser();
  const reminders = await prisma.reminder.findMany({
    include: { user: true, contact: true, event: true },
    orderBy: { dueAt: "asc" },
  });
  const members = await prisma.user.findMany({ where: { deletedAt: null } });
  return (
    <div>
      <PageHeader title="Напоминания" hint="Напомни о себе, благодарность, статус, произвольное" />
      <WriteGate role={user.role}>
        <form action={createReminder} className="mb-6 grid gap-2 rounded-2xl border border-[#2c2c32] bg-[#141416] p-4 md:grid-cols-4">
          <input name="title" placeholder="Заголовок" required />
          <select name="type" defaultValue="CUSTOM">
            {Object.entries(REMINDER_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input type="datetime-local" name="dueAt" required />
          <select name="repeat" defaultValue="NONE">
            <option value="NONE">один раз</option>
            <option value="DAILY">каждый день</option>
            <option value="WEEKLY">каждую неделю</option>
          </select>
          <select name="userId" defaultValue={user.id}>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <input name="body" placeholder="Текст" className="md:col-span-2" />
          <button className="rounded-full bg-[#FF7F3B] text-black">Поставить</button>
        </form>
      </WriteGate>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Когда</th>
              <th>Тип</th>
              <th>Заголовок</th>
              <th>Кому</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((r) => (
              <tr key={r.id}>
                <td>{formatDateTime(r.dueAt)}</td>
                <td>{REMINDER_TYPE_LABELS[r.type]}</td>
                <td>{r.title}</td>
                <td>{r.user?.name}</td>
                <td>{r.sentAt ? "отправлено" : "ждёт"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
