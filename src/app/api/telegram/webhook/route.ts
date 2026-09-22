import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegram } from "@/lib/telegram";
import { webhookCallback } from "grammy";
import { Bot, InlineKeyboard } from "grammy";
import { TASK_CHAIN } from "@/lib/domain/tasks";

export const dynamic = "force-dynamic";

async function handleUpdate(bot: Bot) {
  bot.command("start", async (ctx) => {
    const from = ctx.from;
    if (!from) return;
    const code = ctx.match?.toString();
    const user = code
      ? await prisma.user.findUnique({ where: { id: code } })
      : await prisma.user.findUnique({ where: { telegramId: String(from.id) } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { telegramId: String(from.id), telegramUsername: from.username },
      });
      await ctx.reply("Telegram привязан к CRM. Команды: /tasks /done /comment");
    } else {
      await ctx.reply("Напишите руководителю, чтобы вас пригласили в CRM, затем снова /start.");
    }
  });

  bot.command("tasks", async (ctx) => {
    const user = await prisma.user.findUnique({ where: { telegramId: String(ctx.from?.id) } });
    if (!user) return ctx.reply("Сначала /start");
    const tasks = await prisma.task.findMany({
      where: { assigneeId: user.id, done: false, deletedAt: null },
      include: { sponsorship: true },
      take: 10,
    });
    if (!tasks.length) return ctx.reply("Открытых задач нет.");
    const kb = new InlineKeyboard();
    for (const task of tasks) {
      kb.text(`✓ ${task.title} · ${task.sponsorship.brand}`, `done:${task.id}`).row();
    }
    await ctx.reply("Ваши задачи:", { reply_markup: kb });
  });

  bot.callbackQuery(/^done:(.+)$/, async (ctx) => {
    const id = ctx.match[1];
    await prisma.task.update({ where: { id }, data: { done: true } });
    await ctx.answerCallbackQuery({ text: "Готово" });
    await ctx.editMessageText("Этап отмечен.");
  });

  bot.command("done", async (ctx) => {
    const user = await prisma.user.findUnique({ where: { telegramId: String(ctx.from?.id) } });
    if (!user) return ctx.reply("Сначала /start");
    const task = await prisma.task.findFirst({
      where: { assigneeId: user.id, done: false },
      orderBy: { sortOrder: "asc" },
    });
    if (!task) return ctx.reply("Нечего отмечать");
    await prisma.task.update({ where: { id: task.id }, data: { done: true } });
    await ctx.reply(`Закрыто: ${task.title}`);
  });

  bot.command("comment", async (ctx) => {
    const text = ctx.match?.toString().trim();
    const user = await prisma.user.findUnique({ where: { telegramId: String(ctx.from?.id) } });
    if (!user || !text) return ctx.reply("Формат: /comment текст");
    const task = await prisma.task.findFirst({
      where: { assigneeId: user.id },
      include: { sponsorship: true },
      orderBy: { updatedAt: "desc" },
    });
    if (!task) return ctx.reply("Нет спонсора для комментария");
    await prisma.comment.create({
      data: { body: text, userId: user.id, sponsorshipId: task.sponsorshipId },
    });
    await ctx.reply(`Комментарий к ${task.sponsorship.brand} сохранён.`);
  });
}

export async function POST(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ ok: false }, { status: 501 });
  const bot = new Bot(token);
  await handleUpdate(bot);
  const handler = webhookCallback(bot, "std/http");
  return handler(req);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    stages: TASK_CHAIN.map((s) => s.title),
    ping: typeof sendTelegram,
  });
}
