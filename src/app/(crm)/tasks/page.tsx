import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { TaskRow } from "@/components/task-row";
import { taskProgress } from "@/lib/domain/tasks";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ mine?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const mine = sp.mine === "1";
  const tasks = await prisma.task.findMany({
    where: { deletedAt: null, ...(mine ? { assigneeId: user.id } : {}) },
    include: { sponsorship: true, assignee: true },
    orderBy: [{ sponsorshipId: "asc" }, { sortOrder: "asc" }],
  });
  const members = await prisma.user.findMany({ where: { deletedAt: null } });
  const grouped = new Map<string, typeof tasks>();
  for (const task of tasks) {
    const list = grouped.get(task.sponsorshipId) ?? [];
    list.push(task);
    grouped.set(task.sponsorshipId, list);
  }
  return (
    <div>
      <PageHeader
        title="Задачи"
        hint="Цепочка после подтверждения спонсора"
        actions={
          <>
            <a className={`rounded-full px-4 py-2 ${mine ? "bg-[#1c1c20]" : "bg-[#D5FF49] text-black"}`} href="/tasks">Все</a>
            <a className={`rounded-full px-4 py-2 ${mine ? "bg-[#D5FF49] text-black" : "bg-[#1c1c20]"}`} href="/tasks?mine=1">Мои</a>
          </>
        }
      />
      <div className="space-y-4">
        {[...grouped.entries()].map(([id, list]) => (
          <section key={id} className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl">{list[0]?.sponsorship.brand}</h2>
              <span className="text-[#D5FF49]">{taskProgress(list)}%</span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#2c2c32]">
              <div className="h-full bg-[#D5FF49]" style={{ width: `${taskProgress(list)}%` }} />
            </div>
            <ul className="space-y-2">
              {list.map((task) => (
                <TaskRow
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  done={task.done}
                  assigneeId={task.assigneeId}
                  dueAt={task.dueAt ? task.dueAt.toISOString().slice(0, 16) : null}
                  members={members.map((m) => ({ id: m.id, name: m.name }))}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
