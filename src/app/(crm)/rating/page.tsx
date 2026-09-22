import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { memberScore } from "@/lib/domain/rating";
import { formatMoney } from "@/lib/utils";

export default async function RatingPage() {
  await requireUser();
  const settings = await prisma.appSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
  const users = await prisma.user.findMany({ where: { deletedAt: null, role: { in: ["ADMIN", "MEMBER"] } } });
  const rows = await Promise.all(
    users.map(async (user) => {
      const written = await prisma.pipelineLead.count({ where: { ownerId: user.id, deletedAt: null } });
      const partners = await prisma.sponsorship.count({ where: { finderId: user.id, deletedAt: null } });
      const sums = await prisma.sponsorship.aggregate({
        where: { finderId: user.id, deletedAt: null },
        _sum: { total: true },
      });
      const events = await prisma.sponsorship.findMany({
        where: { finderId: user.id, deletedAt: null },
        distinct: ["eventId"],
        select: { eventId: true },
      });
      const giftSum = Number(sums._sum.total ?? 0);
      const score = memberScore(
        { written, partners, giftSum, events: events.length },
        {
          written: settings.ratingWrittenCoeff,
          partners: settings.ratingPartnerCoeff,
          sum: settings.ratingSumCoeff,
          events: settings.ratingEventCoeff,
        },
      );
      return { user, written, partners, giftSum, events: events.length, score };
    }),
  );
  rows.sort((a, b) => b.score - a.score);
  return (
    <div>
      <PageHeader title="Рейтинг членов центра" hint="Авторасчёт: написано, найдено, сумма, мероприятия" />
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Написано</th>
              <th>Партнёров</th>
              <th>Сумма подарков</th>
              <th>Мероприятий</th>
              <th>Рейтинг</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.user.id}>
                <td>{r.user.name}</td>
                <td>{r.written}</td>
                <td>{r.partners}</td>
                <td>{formatMoney(r.giftSum)}</td>
                <td>{r.events}</td>
                <td className="text-[#D5FF49]">{r.score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
