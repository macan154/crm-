import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rowsToCsv, rowsToExcel } from "@/lib/export";
import { CATEGORY_LABELS } from "@/lib/domain/labels";
import { leadStatusLabel } from "@/lib/domain/pipeline";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") ?? "pipeline";
  const format = url.searchParams.get("format") ?? "xlsx";

  let rows: Record<string, unknown>[] = [];
  if (kind === "pipeline") {
    const leads = await prisma.pipelineLead.findMany({
      where: { deletedAt: null },
      include: { owner: true },
    });
    rows = leads.map((l) => ({
      "Член центра": l.owner?.name,
      Направление: CATEGORY_LABELS[l.category],
      Продукт: l.product,
      Бренд: l.brand,
      Ссылки: l.links,
      Статус: leadStatusLabel(l.status),
      Комментарий: l.comment,
      "Последний контакт": l.lastContactAt,
    }));
  } else if (kind === "sponsors") {
    const items = await prisma.sponsorship.findMany({
      where: { deletedAt: null },
      include: { finder: true, event: true },
    });
    rows = items.map((s) => ({
      Мероприятие: s.event.name,
      "Кто нашёл": s.finder?.name,
      Бренд: s.brand,
      Продукт: s.product,
      Цена: Number(s.unitPrice),
      Количество: s.quantity,
      Сумма: Number(s.total),
      Архив: s.archived ? "да" : "нет",
    }));
  } else if (kind === "contacts" || kind === "backup") {
    const contacts = await prisma.contact.findMany({
      where: kind === "backup" ? {} : { deletedAt: null },
    });
    rows = contacts.map((c) => ({
      Бренд: c.brand,
      ФИО: c.personName,
      Должность: c.position,
      Направление: CATEGORY_LABELS[c.category],
      VK: c.vk,
      Telegram: c.telegram,
      Email: c.email,
      Телефон: c.phone,
    }));
  }

  if (format === "csv") {
    return new NextResponse(rowsToCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=${kind}.csv`,
      },
    });
  }
  const buffer = await rowsToExcel(kind, rows);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${kind}.xlsx`,
    },
  });
}
