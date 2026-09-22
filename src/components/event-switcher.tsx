"use client";

import { chooseEvent } from "@/lib/actions/events";

export function EventSwitcher({
  events,
  current,
}: {
  events: { id: string; name: string }[];
  current: string | null;
}) {
  return (
    <select
      className="md:w-72"
      defaultValue={current ?? ""}
      onChange={(e) => {
        void chooseEvent(e.target.value);
      }}
    >
      <option value="">Мероприятие</option>
      {events.map((event) => (
        <option key={event.id} value={event.id}>
          {event.name}
        </option>
      ))}
    </select>
  );
}
