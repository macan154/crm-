import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Yandex from "next-auth/providers/yandex";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyTelegramLogin } from "@/lib/domain/telegram-auth";
import type { Role } from "@/lib/domain/permissions";

const providers = [
  Credentials({
    id: "credentials",
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Пароль", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? "")
        .trim()
        .toLowerCase();
      const password = String(credentials?.password ?? "");
      if (!email || !password) return null;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash || user.deletedAt) return null;
      const ok = await compare(password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
    },
  }),
  Credentials({
    id: "telegram",
    name: "Telegram",
    credentials: {
      id: { label: "id" },
      first_name: { label: "first_name" },
      last_name: { label: "last_name" },
      username: { label: "username" },
      photo_url: { label: "photo_url" },
      auth_date: { label: "auth_date" },
      hash: { label: "hash" },
    },
    async authorize(credentials) {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token || !credentials?.hash || !credentials.id) return null;
      const payload = {
        id: String(credentials.id),
        first_name: credentials.first_name ? String(credentials.first_name) : undefined,
        last_name: credentials.last_name ? String(credentials.last_name) : undefined,
        username: credentials.username ? String(credentials.username) : undefined,
        photo_url: credentials.photo_url ? String(credentials.photo_url) : undefined,
        auth_date: String(credentials.auth_date),
        hash: String(credentials.hash),
      };
      if (!verifyTelegramLogin(payload, token)) return null;
      const telegramId = String(credentials.id);
      const name = [credentials.first_name, credentials.last_name].filter(Boolean).join(" ") || "Telegram";
      const user = await prisma.user.upsert({
        where: { telegramId },
        update: {
          telegramUsername: credentials.username ? String(credentials.username) : undefined,
          image: credentials.photo_url ? String(credentials.photo_url) : undefined,
        },
        create: {
          name: String(name),
          telegramId,
          telegramUsername: credentials.username ? String(credentials.username) : undefined,
          image: credentials.photo_url ? String(credentials.photo_url) : undefined,
          role: "MEMBER",
        },
      });
      if (user.deletedAt) return null;
      return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }) as never,
  );
}

if (process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET) {
  providers.push(
    Yandex({
      clientId: process.env.YANDEX_CLIENT_ID,
      clientSecret: process.env.YANDEX_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }) as never,
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "MEMBER";
      }
      if (!token.role && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: String(token.id) } });
        token.role = dbUser?.role ?? "MEMBER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = (token.role as Role) ?? "MEMBER";
      }
      return session;
    },
  },
});
