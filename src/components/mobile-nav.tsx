"use client";

import Link from "next/link";
import { useState } from "react";

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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button className="m-3 rounded-full bg-[#FF7F3B] px-3 py-1 text-black" onClick={() => setOpen(true)}>
        Меню
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/70 p-6">
          <button className="mb-4 text-[#FFDDBB]" onClick={() => setOpen(false)}>
            закрыть
          </button>
          <nav className="space-y-2">
            {LINKS.map(([label, href]) => (
              <Link key={href} href={href} className="block text-lg" onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
