import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { getCurrentEventId } from "@/lib/current-event";
import { renderTemplate } from "@/lib/domain/templates";
import { CopyButton } from "@/components/copy-button";

export default async function ReportsPage() {
  await requireUser();
  const eventId = await getCurrentEventId();
  const event = eventId ? await prisma.event.findUnique({ where: { id: eventId } }) : null;
  const sponsors = eventId
    ? await prisma.sponsorship.findMany({ where: { eventId, deletedAt: null } })
    : [];
  const templates = await prisma.messageTemplate.findMany({ orderBy: { name: "asc" } });
  const tableText = sponsors
    .map((s) => `${s.brand}\t${s.product ?? ""}\t${s.total}`)
    .join("\n");
  return (
    <div>
      <PageHeader
        title="Отчёты"
        hint={event?.name ?? "Выберите мероприятие"}
        actions={
          <>
            <a className="rounded-full bg-[#1c1c20] px-4 py-2" href="/api/export?kind=sponsors">Excel</a>
            <a className="rounded-full bg-[#1c1c20] px-4 py-2" href="/api/export?kind=sponsors&format=csv">CSV</a>
            <a className="rounded-full bg-[#D5FF49] px-4 py-2 text-black" href="/api/reports/pdf">PDF</a>
            <a className="rounded-full bg-[#1c1c20] px-4 py-2" href="/api/export?kind=backup">Резервная копия</a>
          </>
        }
      />
      <section className="mb-6 rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
        <h2 className="mb-2 text-xl">Таблица для оргкомитета</h2>
        <pre className="overflow-auto rounded-2xl bg-black p-4 text-xs text-[#FFDDBB]">{tableText || "Нет строк"}</pre>
        <CopyButton text={tableText} />
      </section>
      <section className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
        <h2 className="mb-2 text-xl">Шаблоны в VK / Telegram</h2>
        <div className="space-y-3">
          {templates.map((t) => {
            const first = sponsors[0];
            const text = renderTemplate(t.body, {
              brand: first?.brand,
              product: first?.product,
              event: event?.name,
              guest: first?.guestName,
            });
            return (
              <div key={t.id} className="rounded-2xl bg-[#1c1c20] p-3">
                <p className="text-sm text-[#B477ED]">{t.name} · {t.channel}</p>
                <p className="text-sm">{text}</p>
                <CopyButton text={text} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
