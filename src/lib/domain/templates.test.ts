import { describe, expect, it } from "vitest";
import { renderTemplate } from "./templates";

describe("message templates", () => {
  it("replaces placeholders for vk/telegram copy", () => {
    const text = renderTemplate("Привет, {brand}! Ждём {guest} на {event}.", {
      brand: "Колибри",
      guest: "Анна",
      event: "День первокурсника",
    });
    expect(text).toBe("Привет, Колибри! Ждём Анна на День первокурсника.");
  });
});
