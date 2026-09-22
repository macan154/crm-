import { Bot } from "grammy";

function bot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  return new Bot(token);
}

export async function sendTelegram(chatId: string, text: string) {
  const instance = bot();
  if (!instance) {
    console.info("[telegram:dev]", { chatId, text });
    return { ok: true, dev: true };
  }
  await instance.api.sendMessage(chatId, text);
  return { ok: true, dev: false };
}

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}
