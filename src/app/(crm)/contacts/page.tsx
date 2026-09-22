import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, WriteGate } from "@/components/page-header";
import { upsertContact, softDeleteContact } from "@/lib/actions/contacts";
import { importContactsFile } from "@/lib/actions/integrations";
import { CATEGORY_LABELS } from "@/lib/domain/labels";
import Link from "next/link";

export default async function ContactsPage() {
  const user = await requireUser();
  const contacts = await prisma.contact.findMany({
    where: { deletedAt: null },
    orderBy: { brand: "asc" },
  });
  return (
    <div>
      <PageHeader
        title="Контакты"
        hint="Бренд, человек, соцсети и история"
        actions={<a className="rounded-full bg-[#1c1c20] px-4 py-2" href="/api/export?kind=contacts">Excel</a>}
      />
      <WriteGate role={user.role}>
        <form action={upsertContact} className="mb-4 grid gap-2 rounded-2xl border border-[#2c2c32] bg-[#141416] p-4 md:grid-cols-4">
          <input name="brand" placeholder="Бренд / организация" required />
          <input name="personName" placeholder="ФИО" />
          <input name="position" placeholder="Должность" />
          <select name="category" defaultValue="OTHER">
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input name="vk" placeholder="VK" />
          <input name="telegram" placeholder="Telegram" />
          <input name="whatsapp" placeholder="WhatsApp" />
          <input name="email" placeholder="Email" />
          <input name="phone" placeholder="Телефон" />
          <input name="notes" placeholder="Заметка" className="md:col-span-2" />
          <button className="rounded-full bg-[#FF7F3B] text-black">Сохранить</button>
        </form>
        <form action={importContactsFile} className="mb-4 flex gap-2">
          <input type="file" name="file" accept=".xlsx,.xls" />
          <button className="rounded-full bg-[#DEBAFF] px-4 text-black">Импорт Excel</button>
        </form>
      </WriteGate>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Бренд</th>
              <th>ФИО</th>
              <th>Должность</th>
              <th>Направление</th>
              <th>Связь</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td><Link href={`/contacts/${c.id}`} className="text-[#D5FF49]">{c.brand}</Link></td>
                <td>{c.personName}</td>
                <td>{c.position}</td>
                <td>{CATEGORY_LABELS[c.category]}</td>
                <td>{[c.telegram, c.vk, c.email, c.phone].filter(Boolean).join(" · ")}</td>
                <td>
                  {user.role !== "VIEWER" ? (
                    <form action={async () => { "use server"; await softDeleteContact(c.id); }}>
                      <button className="text-[#FF5A5A]">удалить</button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
