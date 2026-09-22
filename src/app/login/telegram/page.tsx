"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function TelegramCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, "") || window.location.search);
    const payload = {
      id: params.get("id"),
      first_name: params.get("first_name"),
      last_name: params.get("last_name"),
      username: params.get("username"),
      photo_url: params.get("photo_url"),
      auth_date: params.get("auth_date"),
      hash: params.get("hash"),
    };
    if (!payload.hash || !payload.id) return;
    void signIn("telegram", { ...payload, callbackUrl: "/dashboard" });
  }, []);
  return <p className="p-8 text-[#FFDDBB]">Входим через Telegram…</p>;
}
