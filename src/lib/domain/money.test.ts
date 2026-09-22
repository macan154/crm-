import { describe, expect, it } from "vitest";
import { sponsorshipTotal } from "./money";

describe("sponsorshipTotal", () => {
  it("multiplies unit price by quantity", () => {
    expect(sponsorshipTotal(1500, 4)).toBe(6000);
  });

  it("treats missing quantity as 1 and missing price as 0", () => {
    expect(sponsorshipTotal(200, null)).toBe(200);
    expect(sponsorshipTotal(null, 5)).toBe(0);
  });
});
