"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm({
  google,
  yandex,
  telegramBot,
}: {
  google: boolean;
  yandex: boolean;
  telegramBot?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard" });
    if (res?.error) setError("Неверный email или пароль");
    else window.location.href = "/dashboard";
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button className="w-full rounded-full bg-[#FF7F3B] py-3 font-medium text-black">Войти</button>
      </form>
      <div className="grid gap-2">
        {google ? (
          <button
            className="rounded-full border border-[#2c2c32] py-2"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Google
          </button>
        ) : null}
        {yandex ? (
          <button
            className="rounded-full border border-[#2c2c32] py-2"
            onClick={() => signIn("yandex", { callbackUrl: "/dashboard" })}
          >
            Яндекс
          </button>
        ) : null}
        {telegramBot ? <TelegramButton bot={telegramBot} /> : null}
      </div>
    </div>
  );
}

function TelegramButton({ bot }: { bot: string }) {
  return (
    <button
      className="rounded-full border border-[#2c2c32] py-2"
      onClick={() => {
        const origin = encodeURIComponent(window.location.origin + "/login/telegram");
        window.location.href = `https://oauth.telegram.org/auth?bot_id=${bot}&origin=${origin}&request_access=write&embed=1`;
      }}
    >
      Telegram
    </button>
  );
}
