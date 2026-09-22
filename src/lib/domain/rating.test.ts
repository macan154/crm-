import { describe, expect, it } from "vitest";
import { memberScore } from "./rating";

describe("member rating", () => {
  it("uses settings coefficients", () => {
    const score = memberScore(
      { written: 10, partners: 2, giftSum: 50000, events: 3 },
      { written: 1, partners: 3, sum: 0.001, events: 2 },
    );
    expect(score).toBe(10 * 1 + 2 * 3 + 50000 * 0.001 + 3 * 2);
  });
});
