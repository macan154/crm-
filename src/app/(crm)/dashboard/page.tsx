import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getCurrentEventId } from "@/lib/current-event";
import { PageHeader } from "@/components/page-header";
import { formatMoney } from "@/lib/utils";
import { taskProgress } from "@/lib/domain/tasks";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireUser();
  const eventId = await getCurrentEventId();
  const [leads, sponsors, myTasks, reminders] = await Promise.all([
    prisma.pipelineLead.count({ where: { deletedAt: null } }),
    prisma.sponsorship.findMany({ where: { deletedAt: null, ...(eventId ? { eventId } : {}) } }),
    prisma.task.findMany({
      where: { assigneeId: user.id, deletedAt: null },
      include: { sponsorship: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
    }),
    prisma.reminder.findMany({
      where: { sentAt: null },
      orderBy: { dueAt: "asc" },
      take: 6,
    }),
  ]);
  const sum = sponsors.reduce((acc, s) => acc + Number(s.total), 0);
  const agreed = await prisma.pipelineLead.count({ where: { status: "AGREED", deletedAt: null } });

  return (
    <div>
      <PageHeader title="Дашборд" hint="Сводка по текущему мероприятию" />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="В воронке" value={String(leads)} color="#FF7F3B" />
        <Stat label="Согласились" value={String(agreed)} color="#D5FF49" />
        <Stat label="Сумма подарков" value={formatMoney(sum)} color="#DEBAFF" />
        <Stat label="Мои задачи" value={String(myTasks.filter((t) => !t.done).length)} color="#B477ED" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
          <h2 className="mb-3 text-xl">Мои задачи</h2>
          <ul className="space-y-2 text-sm">
            {myTasks.map((task) => (
              <li key={task.id} className="flex justify-between gap-3 rounded-xl bg-[#1c1c20] px-3 py-2">
                <span>
                  {task.title} · {task.sponsorship.brand}
                </span>
                <span className={task.done ? "text-[#D5FF49]" : "text-[#FF7F3B]"}>{task.done ? "готово" : "открыто"}</span>
              </li>
            ))}
          </ul>
          <Link href="/tasks" className="mt-3 inline-block text-sm text-[#FF7F3B]">
            Все задачи
          </Link>
        </section>
        <section className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
          <h2 className="mb-3 text-xl">Ближайшие напоминания</h2>
          <ul className="space-y-2 text-sm">
            {reminders.map((item) => (
              <li key={item.id} className="rounded-xl bg-[#1c1c20] px-3 py-2">
                {item.title}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="mt-4 hidden text-xs text-[#2c2c32]">{taskProgress(myTasks)}</p>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5" style={{ boxShadow: `inset 0 0 0 1px ${color}22` }}>
      <p className="text-sm text-[#FFDDBB]">{label}</p>
      <p className="mt-2 text-2xl" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
