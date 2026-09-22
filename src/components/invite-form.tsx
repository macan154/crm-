"use client";

import { acceptInvite } from "@/lib/actions/users";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteForm({ token, email }: { token: string; email: string }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await acceptInvite(token, name, password);
          router.push("/login");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Ошибка");
        }
      }}
    >
      <p className="text-sm text-[#FFDDBB]">{email}</p>
      <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button className="w-full rounded-full bg-[#D5FF49] py-3 text-black">Создать аккаунт</button>
    </form>
  );
}
