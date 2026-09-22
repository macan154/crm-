import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, WriteGate } from "@/components/page-header";
import { PipelineTable } from "@/components/pipeline-table";
import { CATEGORY_LABELS } from "@/lib/domain/labels";

export default async function PipelinePage() {
  const user = await requireUser();
  const [leads, members, filters] = await Promise.all([
    prisma.pipelineLead.findMany({
      where: { deletedAt: null },
      include: { owner: true, contact: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.savedFilter.findMany({ where: { userId: user.id, page: "pipeline" } }),
  ]);
  return (
    <div>
      <PageHeader
        title="Потенциальные спонсоры"
        hint="Воронка с цветами статусов, массовыми действиями и экспортом"
        actions={
          <>
            <a className="rounded-full bg-[#1c1c20] px-4 py-2 text-sm" href="/api/export?kind=pipeline&format=xlsx">
              Excel
            </a>
            <a className="rounded-full bg-[#1c1c20] px-4 py-2 text-sm" href="/api/export?kind=pipeline&format=csv">
              CSV
            </a>
          </>
        }
      />
      <WriteGate role={user.role}>
        <PipelineTable
          leads={leads.map((l) => ({
            id: l.id,
            ownerId: l.ownerId,
            ownerName: l.owner?.name ?? "—",
            category: l.category,
            product: l.product ?? "",
            brand: l.brand,
            links: l.links ?? "",
            status: l.status,
            comment: l.comment ?? "",
            lastContactAt: l.lastContactAt.toISOString(),
            rowColor: l.rowColor,
            contactId: l.contactId,
          }))}
          members={members.map((m) => ({ id: m.id, name: m.name }))}
          role={user.role}
          filters={filters.map((f) => ({ id: f.id, name: f.name, payload: f.payload }))}
        />
      </WriteGate>
      {user.role === "VIEWER" ? (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Член центра</th>
                <th>Направление</th>
                <th>Продукт</th>
                <th>Бренд</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>{l.owner?.name}</td>
                  <td>{CATEGORY_LABELS[l.category]}</td>
                  <td>{l.product}</td>
                  <td>{l.brand}</td>
                  <td>{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
