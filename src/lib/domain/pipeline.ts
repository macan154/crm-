export type LeadStatus = "AGREED" | "NO_REPLY" | "REFUSED" | "NEXT_EVENT";

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  AGREED: "#D5FF49",
  NO_REPLY: "#FF7F3B",
  REFUSED: "#FF5A5A",
  NEXT_EVENT: "#B477ED",
};

export function leadStatusLabel(status: LeadStatus) {
  switch (status) {
    case "AGREED":
      return "согласился";
    case "NO_REPLY":
      return "не ответил";
    case "REFUSED":
      return "отказался";
    case "NEXT_EVENT":
      return "написать на следующем мероприятии";
  }
}

export function rowBackground(status: LeadStatus, manual?: string | null) {
  return manual || LEAD_STATUS_COLORS[status];
}
