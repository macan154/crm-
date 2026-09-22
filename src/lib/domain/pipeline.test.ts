import { describe, expect, it } from "vitest";
import {
  LEAD_STATUS_COLORS,
  leadStatusLabel,
  rowBackground,
} from "./pipeline";

describe("pipeline status colors", () => {
  it("maps TZ statuses to brand colors", () => {
    expect(LEAD_STATUS_COLORS.AGREED).toBe("#D5FF49");
    expect(LEAD_STATUS_COLORS.NO_REPLY).toBe("#FF7F3B");
    expect(LEAD_STATUS_COLORS.REFUSED).toBe("#FF5A5A");
    expect(LEAD_STATUS_COLORS.NEXT_EVENT).toBe("#B477ED");
  });

  it("prefers manual row color over status", () => {
    expect(rowBackground("AGREED", "#112233")).toBe("#112233");
    expect(rowBackground("AGREED", null)).toBe("#D5FF49");
  });

  it("returns russian labels", () => {
    expect(leadStatusLabel("AGREED")).toBe("согласился");
    expect(leadStatusLabel("NO_REPLY")).toBe("не ответил");
    expect(leadStatusLabel("REFUSED")).toBe("отказался");
    expect(leadStatusLabel("NEXT_EVENT")).toBe("написать на следующем мероприятии");
  });
});
