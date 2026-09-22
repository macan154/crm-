import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden items-center justify-center overflow-hidden bg-black lg:flex">
        <Image src="/brand/logo-outline.jpg" alt="" fill className="object-contain p-24 opacity-90" />
      </section>
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-[#2c2c32] bg-[#141416]/80 p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#FFDDBB]">телеграм-канал · сгупс</p>
            <h1 className="mt-2 text-3xl text-white">Центр работы со спонсорами</h1>
            <p className="mt-2 text-[#FFDDBB]">мы реально крутые ееее</p>
          </div>
          <LoginForm
            google={Boolean(process.env.GOOGLE_CLIENT_ID)}
            yandex={Boolean(process.env.YANDEX_CLIENT_ID)}
            telegramBot={process.env.TELEGRAM_BOT_USERNAME}
          />
        </div>
      </section>
    </main>
  );
}
