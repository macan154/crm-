import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type TelegramLoginPayload = {
  id: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string | number;
  hash: string;
};

export function verifyTelegramLogin(payload: TelegramLoginPayload, botToken: string) {
  const { hash, ...rest } = payload;
  if (!hash || !botToken) return false;
  const dataCheckString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key as keyof typeof rest]}`)
    .join("\n");
  const secret = createHash("sha256").update(botToken).digest();
  const computed = createHmac("sha256", secret).update(dataCheckString).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(String(hash)));
  } catch {
    return false;
  }
}
