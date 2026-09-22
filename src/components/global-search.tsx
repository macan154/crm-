"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();
  return (
    <form
      className="flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
    >
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Глобальный поиск: бренд, человек, задача…" />
    </form>
  );
}
