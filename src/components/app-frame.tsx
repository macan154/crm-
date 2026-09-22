"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import type { Role } from "@/lib/domain/permissions";

export function AppFrame({
  name,
  role,
  topbar,
  children,
}: {
  name: string;
  role: Role;
  topbar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <div className={`fixed inset-y-0 z-30 ${open ? "block" : "hidden"} md:static md:block`}>
        <Sidebar name={name} role={role} />
      </div>
      {open ? (
        <button className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setOpen(false)} aria-label="Закрыть меню" />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-[#2c2c32] md:border-0">
          <button className="m-3 rounded-full bg-[#FF7F3B] px-3 py-1 text-black md:hidden" onClick={() => setOpen(true)}>
            Меню
          </button>
        </div>
        {topbar}
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
