import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/auth";
import type { Role } from "@/lib/domain/permissions";

const LINKS = [
  ["Дашборд", "/dashboard"],
  ["Воронка", "/pipeline"],
  ["Спонсоры", "/sponsors"],
  ["Контакты", "/contacts"],
  ["Задачи", "/tasks"],
  ["Документы", "/documents"],
  ["Архив", "/archive"],
  ["Рейтинг", "/rating"],
  ["Календарь", "/calendar"],
  ["Напоминания", "/reminders"],
  ["Отчёты", "/reports"],
  ["Мероприятия", "/events"],
  ["Настройки", "/settings"],
  ["История", "/audit"],
] as const;

export function Sidebar({
  name,
  role,
}: {
  name: string;
  role: Role;
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[#2c2c32] bg-[#0e0e11] p-4">
      <div className="mb-6 flex items-center gap-3 px-2">
        <Image src="/brand/logo.jpg" alt="Логотип" width={48} height={48} className="rounded-full" />
        <div>
          <p className="font-display text-sm leading-tight text-white">Центр спонсоров</p>
          <p className="text-xs text-[#FFDDBB]">СГУПС</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 text-sm">
        {LINKS.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded-xl px-3 py-2 text-[#FFDDBB] hover:bg-[#1c1c20] hover:text-white">
            {label}
          </Link>
        ))}
      </nav>
      <div className="rounded-2xl bg-[#1c1c20] p-3 text-xs">
        <p className="text-white">{name}</p>
        <p className="text-[#B477ED]">{role === "ADMIN" ? "Руководитель" : role === "MEMBER" ? "Член центра" : "Смотрящий"}</p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="mt-2 text-[#FF7F3B]">Выйти</button>
        </form>
      </div>
    </aside>
  );
}
