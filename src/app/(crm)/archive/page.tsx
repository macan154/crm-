import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { CATEGORY_LABELS } from "@/lib/domain/labels";
import { formatMoney } from "@/lib/utils";

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ year?: string; eventId?: string; category?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const events = await prisma.event.findMany({ where: { deletedAt: null }, orderBy: { startsAt: "desc" } });
  const items = await prisma.sponsorship.findMany({
    where: {
      deletedAt: null,
      ...(sp.eventId ? { eventId: sp.eventId } : {}),
      ...(sp.category ? { category: sp.category as never } : {}),
      ...(sp.year
        ? { event: { startsAt: { gte: new Date(`${sp.year}-01-01`), lt: new Date(`${Number(sp.year) + 1}-01-01`) } } }
        : {}),
    },
    include: { event: true, finder: true, contact: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <PageHeader title="Архив спонсоров" hint="Все, кто когда-либо сотрудничал" />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="year" placeholder="Год" defaultValue={sp.year} />
        <select name="eventId" defaultValue={sp.eventId ?? ""}>
          <option value="">Мероприятие</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select name="category" defaultValue={sp.category ?? ""}>
          <option value="">Направление</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="rounded-full bg-[#B477ED] px-4 text-black">Фильтр</button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Год</th>
              <th>Мероприятие</th>
              <th>Бренд</th>
              <th>Контакт</th>
              <th>Сумма</th>
              <th>Кто нашёл</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.event.startsAt.getFullYear()}</td>
                <td>{s.event.name}</td>
                <td>{s.brand}</td>
                <td>{s.contact.personName || s.contact.phone || s.contact.email}</td>
                <td>{formatMoney(s.total)}</td>
                <td>{s.finder?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
