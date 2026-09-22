import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { createInvite, saveSettings, saveTemplate, updateUserRole } from "@/lib/actions/users";
import { ROLE_LABELS } from "@/lib/domain/labels";
import type { Role } from "@prisma/client";

export default async function SettingsPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    return <p>Настройки доступны только руководителю.</p>;
  }
  const [users, settings, templates, invites] = await Promise.all([
    prisma.user.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.appSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } }),
    prisma.messageTemplate.findMany(),
    prisma.invite.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  return (
    <div className="space-y-8">
      <PageHeader title="Настройки" hint="Пользователи, коэффициенты, токены, шаблоны" />
      <section className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
        <h2 className="mb-3 text-xl">Пригласить</h2>
        <form action={createInvite} className="flex flex-wrap gap-2">
          <input name="email" type="email" placeholder="email" required />
          <select name="role" defaultValue="MEMBER">
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="rounded-full bg-[#D5FF49] px-4 text-black">Отправить</button>
        </form>
        <ul className="mt-3 text-xs text-[#FFDDBB]">
          {invites.map((i) => (
            <li key={i.id}>{i.email} · {i.usedAt ? "использовано" : i.token}</li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
        <h2 className="mb-3 text-xl">Роли</h2>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Имя</th><th>Email</th><th>Telegram</th><th>Роль</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.telegramUsername || u.telegramId}</td>
                  <td>
                    <form action={async (fd) => { "use server"; await updateUserRole(u.id, String(fd.get("role")) as Role); }}>
                      <select name="role" defaultValue={u.role}>
                        {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <button className="ml-2 text-xs">ок</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
        <h2 className="mb-3 text-xl">Коэффициенты и VK</h2>
        <form action={saveSettings} className="grid gap-2 md:grid-cols-2">
          <label>написано<input name="ratingWrittenCoeff" defaultValue={settings.ratingWrittenCoeff} /></label>
          <label>партнёры<input name="ratingPartnerCoeff" defaultValue={settings.ratingPartnerCoeff} /></label>
          <label>сумма<input name="ratingSumCoeff" defaultValue={settings.ratingSumCoeff} /></label>
          <label>мероприятия<input name="ratingEventCoeff" defaultValue={settings.ratingEventCoeff} /></label>
          <input name="vkGroupId" placeholder="VK group id" defaultValue={settings.vkGroupId ?? ""} />
          <input name="vkToken" placeholder="VK token" defaultValue={settings.vkToken ?? ""} />
          <input name="telegramBotUsername" placeholder="Telegram bot username" defaultValue={settings.telegramBotUsername ?? ""} />
          <button className="rounded-full bg-[#FF7F3B] text-black">Сохранить</button>
        </form>
        <p className="mt-2 text-xs text-[#FFDDBB]">
          Telegram login и бот используют TELEGRAM_BOT_TOKEN в env. Привязка: откройте бота и отправьте /start {user.id}
        </p>
      </section>
      <section className="rounded-3xl border border-[#2c2c32] bg-[#141416] p-5">
        <h2 className="mb-3 text-xl">Шаблоны</h2>
        <form action={saveTemplate} className="grid gap-2 md:grid-cols-3">
          <input name="name" placeholder="Название" required />
          <select name="channel" defaultValue="vk">
            <option value="vk">VK</option>
            <option value="telegram">Telegram</option>
          </select>
          <input name="body" placeholder="Текст с {'{brand}'} {'{event}'}" />
          <button className="rounded-full bg-[#DEBAFF] text-black">Добавить</button>
        </form>
        <ul className="mt-3 text-sm">
          {templates.map((t) => <li key={t.id}>{t.name}: {t.body}</li>)}
        </ul>
      </section>
    </div>
  );
}
