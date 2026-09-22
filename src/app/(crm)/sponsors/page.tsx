import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getCurrentEventId } from "@/lib/current-event";
import { PageHeader } from "@/components/page-header";
import { SponsorsTable } from "@/components/sponsors-table";
import { formatMoney } from "@/lib/utils";

export default async function SponsorsPage() {
  const user = await requireUser();
  const eventId = await getCurrentEventId();
  const event = eventId ? await prisma.event.findUnique({ where: { id: eventId } }) : null;
  const items = eventId
    ? await prisma.sponsorship.findMany({
        where: { eventId, deletedAt: null, archived: false },
        include: { finder: true, tasks: true, documents: true },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const sum = items.reduce((acc, s) => acc + Number(s.total), 0);
  const members = await prisma.user.findMany({ where: { deletedAt: null } });
  return (
    <div>
      <PageHeader
        title="Подтверждённые спонсоры"
        hint={event ? event.name : "Выберите мероприятие"}
        actions={
          <>
            <span className="rounded-full bg-[#D5FF49] px-4 py-2 text-black">Итого {formatMoney(sum)}</span>
            <a className="rounded-full bg-[#1c1c20] px-4 py-2 text-sm" href="/api/export?kind=sponsors">
              Excel
            </a>
          </>
        }
      />
      <SponsorsTable
        role={user.role}
        customFields={(event?.customFields as { id: string; name: string; type: "text" | "number" | "bool" | "file" }[]) ?? []}
        eventId={eventId}
        members={members.map((m) => ({ id: m.id, name: m.name }))}
        items={items.map((s) => ({
          id: s.id,
          finderName: s.finder?.name ?? "—",
          category: s.category,
          product: s.product ?? "",
          brand: s.brand,
          unitPrice: Number(s.unitPrice),
          quantity: s.quantity,
          total: Number(s.total),
          links: s.links ?? "",
          hasLogo: s.hasLogo,
          hasPostText: s.hasPostText,
          adFormat: s.adFormat,
          vkPostStatus: s.vkPostStatus,
          guestName: s.guestName ?? "",
          needsTable: s.needsTable,
          isJury: s.isJury,
          customValues: (s.customValues as Record<string, string>) ?? {},
          progress: s.tasks.length ? Math.round((s.tasks.filter((t) => t.done).length / s.tasks.length) * 100) : 0,
        }))}
      />
    </div>
  );
}
