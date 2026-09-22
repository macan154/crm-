import { describe, expect, it } from "vitest";
import { TASK_CHAIN, taskProgress } from "./tasks";

describe("task chain", () => {
  it("creates five stages from the spec after a sponsor agrees", () => {
    expect(TASK_CHAIN.map((s) => s.stage)).toEqual([
      "TERMS",
      "MATERIALS",
      "GIFT_COLLECTED",
      "POST_PUBLISHED",
      "REPORT_SENT",
    ]);
    expect(TASK_CHAIN[0].title).toBe("Обсуждение условий");
    expect(TASK_CHAIN[4].title).toBe("Отчёт о мероприятии отправлен");
  });

  it("computes progress as done / total", () => {
    expect(taskProgress([{ done: true }, { done: true }, { done: false }, { done: false }, { done: false }])).toBe(40);
    expect(taskProgress([])).toBe(0);
  });
});
