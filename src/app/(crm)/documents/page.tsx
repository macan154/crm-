import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, WriteGate } from "@/components/page-header";
import { uploadDocument } from "@/lib/actions/documents";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/domain/labels";
import { formatDate } from "@/lib/utils";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const { q } = await searchParams;
  const documents = await prisma.document.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { tags: { has: q } },
            ],
          }
        : {}),
    },
    include: { uploadedBy: true, contact: true, event: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <PageHeader title="Документы" hint="КП, письма, чек-листы, шаблоны, отчёты" />
        <form className="mb-4" method="get">
        <input name="q" defaultValue={q} placeholder="Поиск по названию и тегам" />
      </form>
      <WriteGate role={user.role}>
        <form action={uploadDocument} className="mb-6 grid gap-2 rounded-2xl border border-[#2c2c32] bg-[#141416] p-4 md:grid-cols-4">
          <input name="title" placeholder="Название" />
          <select name="category" defaultValue="COMMERCIAL">
            {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input name="tags" placeholder="теги через запятую" />
          <input type="file" name="file" required />
          <button className="rounded-full bg-[#FF7F3B] text-black">Загрузить</button>
        </form>
      </WriteGate>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Название</th>
              <th>Категория</th>
              <th>Теги</th>
              <th>Связь</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id}>
                <td><a className="text-[#D5FF49]" href={d.url} target="_blank">{d.title}</a></td>
                <td>{DOCUMENT_CATEGORY_LABELS[d.category]}</td>
                <td>{d.tags.join(", ")}</td>
                <td>{d.contact?.brand || d.event?.name || "—"}</td>
                <td>{formatDate(d.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
