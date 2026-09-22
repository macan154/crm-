"use client";

import { assignTask, setTaskDue, toggleTask } from "@/lib/actions/tasks";
import { useTransition } from "react";

export function TaskRow({
  id,
  title,
  done,
  assigneeId,
  dueAt,
  members,
}: {
  id: string;
  title: string;
  done: boolean;
  assigneeId: string | null;
  dueAt: string | null;
  members: { id: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  return (
    <li className="grid gap-2 rounded-xl bg-[#1c1c20] p-3 md:grid-cols-4 md:items-center">
      <label className="flex items-center gap-2">
        <input type="checkbox" defaultChecked={done} onChange={(e) => start(() => toggleTask(id, e.target.checked))} />
        {title}
      </label>
      <select
        defaultValue={assigneeId ?? ""}
        onChange={(e) => start(() => assignTask(id, e.target.value || null))}
      >
        <option value="">Ответственный</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        defaultValue={dueAt ?? ""}
        onBlur={(e) => start(() => setTaskDue(id, e.target.value || null))}
      />
      {pending ? <span className="text-xs text-[#FFDDBB]">…</span> : null}
    </li>
  );
}
