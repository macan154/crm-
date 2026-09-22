import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { createElement } from "react";
import { getCurrentEventId } from "@/lib/current-event";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, color: "#111" },
  h1: { fontSize: 18, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "1px solid #ddd" },
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const eventId = await getCurrentEventId();
  const event = eventId ? await prisma.event.findUnique({ where: { id: eventId } }) : null;
  const items = eventId
    ? await prisma.sponsorship.findMany({ where: { eventId, deletedAt: null } })
    : [];
  const sum = items.reduce((acc, s) => acc + Number(s.total), 0);

  const doc = createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", style: styles.page },
      createElement(Text, { style: styles.h1 }, `Отчёт: ${event?.name ?? "мероприятие"}`),
      createElement(Text, {}, `Центр по работе со спонсорами СГУПС. Сумма: ${formatMoney(sum)}`),
      ...items.map((s) =>
        createElement(
          View,
          { style: styles.row, key: s.id },
          createElement(Text, {}, s.brand),
          createElement(Text, {}, formatMoney(s.total)),
        ),
      ),
    ),
  );

  const buffer = await renderToBuffer(doc as never);
  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=report.pdf",
    },
  });
}
