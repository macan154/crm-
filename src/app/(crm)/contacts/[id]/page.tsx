import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { addInteraction } from "@/lib/actions/contacts";
import { addComment } from "@/lib/actions/integrations";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/session";

export default async function ContactCard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      interactions: { orderBy: { createdAt: "desc" }, include: { user: true } },
      comments: { orderBy: { createdAt: "desc" }, include: { user: true } },
      leads: true,
      sponsorships: { include: { event: true } },
    },
  });
  if (!contact) notFound();
  return (
    <div>
      <PageHeader title={contact.brand} hint={[contact.personName, contact.position].filter(Boolean).join(" · ")} />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
          <h2 className="mb-3 text-xl">История</h2>
          <form action={async (fd) => { "use server"; await addInteraction(id, String(fd.get("body"))); }} className="mb-4 space-y-2">
            <textarea name="body" placeholder="Комментарий, дата, статус" required />
            <button className="rounded-full bg-[#FF7F3B] px-4 py-2 text-black">Добавить</button>
          </form>
          <ul className="space-y-2 text-sm">
            {contact.interactions.map((i) => (
              <li key={i.id} className="rounded-xl bg-[#1c1c20] p-3">
                <p>{i.body}</p>
                <p className="text-xs text-[#FFDDBB]">{i.user?.name} · {formatDateTime(i.createdAt)}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
          <h2 className="mb-3 text-xl">Мероприятия</h2>
          <ul className="space-y-2 text-sm">
            {contact.sponsorships.map((s) => (
              <li key={s.id}>{s.event.name} · {s.brand}</li>
            ))}
          </ul>
          <form action={async (fd) => { "use server"; await addComment("contact", id, String(fd.get("body"))); }} className="mt-4 space-y-2">
            <textarea name="body" placeholder="Комментарий" required />
            <button className="rounded-full bg-[#B477ED] px-4 py-2 text-black">Комментарий</button>
          </form>
        </section>
      </div>
    </div>
  );
}
