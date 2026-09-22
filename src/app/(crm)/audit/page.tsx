import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

export default async function AuditPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") return <p>Только руководитель.</p>;
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <div>
      <PageHeader title="История изменений" hint="Кто и когда изменил запись" />
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Когда</th>
              <th>Кто</th>
              <th>Действие</th>
              <th>Сущность</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{formatDateTime(log.createdAt)}</td>
                <td>{log.user?.name}</td>
                <td>{log.action}</td>
                <td>{log.entity}</td>
                <td>{log.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
