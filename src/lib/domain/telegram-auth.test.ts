import { createHmac, createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyTelegramLogin } from "./telegram-auth";

describe("telegram login", () => {
  it("accepts a valid widget payload", () => {
    const botToken = "123:abc";
    const payload = { id: "42", first_name: "Ada", auth_date: "1700000000" };
    const dataCheck = Object.keys(payload)
      .sort()
      .map((k) => `${k}=${payload[k as keyof typeof payload]}`)
      .join("\n");
    const secret = createHash("sha256").update(botToken).digest();
    const hash = createHmac("sha256", secret).update(dataCheck).digest("hex");
    expect(verifyTelegramLogin({ ...payload, hash }, botToken)).toBe(true);
  });

  it("rejects a tampered payload", () => {
    expect(
      verifyTelegramLogin(
        { id: "42", first_name: "Ada", auth_date: "1700000000", hash: "00" },
        "123:abc",
      ),
    ).toBe(false);
  });
});
