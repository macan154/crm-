import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const [contacts, leads, sponsors, tasks, docs] = query
    ? await Promise.all([
        prisma.contact.findMany({
          where: { deletedAt: null, OR: [{ brand: { contains: query, mode: "insensitive" } }, { personName: { contains: query, mode: "insensitive" } }] },
          take: 10,
        }),
        prisma.pipelineLead.findMany({
          where: { deletedAt: null, OR: [{ brand: { contains: query, mode: "insensitive" } }, { product: { contains: query, mode: "insensitive" } }] },
          take: 10,
        }),
        prisma.sponsorship.findMany({
          where: { deletedAt: null, brand: { contains: query, mode: "insensitive" } },
          take: 10,
        }),
        prisma.task.findMany({
          where: { deletedAt: null, title: { contains: query, mode: "insensitive" } },
          include: { sponsorship: true },
          take: 10,
        }),
        prisma.document.findMany({
          where: { deletedAt: null, title: { contains: query, mode: "insensitive" } },
          take: 10,
        }),
      ])
    : [[], [], [], [], []];
  return (
    <div>
      <PageHeader title="Поиск" hint={query || "Введите запрос в шапке"} />
      <Section title="Контакты">{contacts.map((c) => <Link key={c.id} href={`/contacts/${c.id}`} className="block">{c.brand}</Link>)}</Section>
      <Section title="Воронка">{leads.map((l) => <p key={l.id}>{l.brand}</p>)}</Section>
      <Section title="Спонсоры">{sponsors.map((s) => <p key={s.id}>{s.brand}</p>)}</Section>
      <Section title="Задачи">{tasks.map((t) => <p key={t.id}>{t.title} · {t.sponsorship.brand}</p>)}</Section>
      <Section title="Документы">{docs.map((d) => <a key={d.id} href={d.url}>{d.title}</a>)}</Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4 rounded-3xl border border-[#2c2c32] bg-[#141416] p-4">
      <h2 className="mb-2 text-lg">{title}</h2>
      <div className="space-y-1 text-sm text-[#FFDDBB]">{children}</div>
    </section>
  );
}
