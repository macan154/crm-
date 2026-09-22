"use client";

import { useMemo, useState, useTransition } from "react";
import { bulkLeadStatus, softDeleteLead, upsertLead } from "@/lib/actions/leads";
import { saveFilter } from "@/lib/actions/reminders";
import { CATEGORY_LABELS } from "@/lib/domain/labels";
import { LEAD_STATUS_COLORS, leadStatusLabel, type LeadStatus } from "@/lib/domain/pipeline";
import { formatDate } from "@/lib/utils";

type LeadRow = {
  id: string;
  ownerId: string | null;
  ownerName: string;
  category: keyof typeof CATEGORY_LABELS;
  product: string;
  brand: string;
  links: string;
  status: LeadStatus;
  comment: string;
  lastContactAt: string;
  rowColor: string | null;
  contactId: string;
};

export function PipelineTable({
  leads,
  members,
  role,
  filters,
}: {
  leads: LeadRow[];
  members: { id: string; name: string }[];
  role: string;
  filters: { id: string; name: string; payload: unknown }[];
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, start] = useTransition();

  const visible = useMemo(() => {
    return leads.filter((l) => {
      const blob = `${l.brand} ${l.product} ${l.comment} ${l.ownerName}`.toLowerCase();
      if (q && !blob.includes(q.toLowerCase())) return false;
      if (status && l.status !== status) return false;
      return true;
    });
  }, [leads, q, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input className="max-w-xs" placeholder="Поиск" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Все статусы</option>
          {Object.keys(LEAD_STATUS_COLORS).map((s) => (
            <option key={s} value={s}>
              {leadStatusLabel(s as LeadStatus)}
            </option>
          ))}
        </select>
        <button
          className="rounded-full bg-[#1c1c20] px-4"
          onClick={() => start(() => saveFilter("pipeline", `Фильтр ${q || status || "все"}`, { q, status }))}
        >
          Сохранить фильтр
        </button>
        {selected.length ? (
          <select
            className="max-w-xs"
            onChange={(e) => {
              const value = e.target.value as LeadStatus;
              if (!value) return;
              start(() => bulkLeadStatus(selected, value));
            }}
          >
            <option value="">Массовый статус</option>
            {Object.keys(LEAD_STATUS_COLORS).map((s) => (
              <option key={s} value={s}>
                {leadStatusLabel(s as LeadStatus)}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {filters.length ? (
        <p className="text-xs text-[#FFDDBB]">Сохранённые: {filters.map((f) => f.name).join(", ")}</p>
      ) : null}
      <LeadForm members={members} />
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th />
              <th>Член центра</th>
              <th>Направление</th>
              <th>Товар / услуга</th>
              <th>Бренд</th>
              <th>Ссылки</th>
              <th>Статус</th>
              <th>Комментарий</th>
              <th>Контакт</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((lead) => (
              <tr key={lead.id} style={{ background: `${lead.rowColor || LEAD_STATUS_COLORS[lead.status]}22` }}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(lead.id)}
                    onChange={(e) =>
                      setSelected((prev) => (e.target.checked ? [...prev, lead.id] : prev.filter((id) => id !== lead.id)))
                    }
                  />
                </td>
                <td>{lead.ownerName}</td>
                <td>{CATEGORY_LABELS[lead.category]}</td>
                <td>{lead.product}</td>
                <td>{lead.brand}</td>
                <td>{lead.links}</td>
                <td>
                  <span className="chip" style={{ background: LEAD_STATUS_COLORS[lead.status] }}>
                    {leadStatusLabel(lead.status)}
                  </span>
                </td>
                <td>{lead.comment}</td>
                <td>{formatDate(lead.lastContactAt)}</td>
                <td>
                  {role !== "VIEWER" ? (
                    <button className="text-[#FF5A5A]" onClick={() => start(() => softDeleteLead(lead.id))}>
                      удалить
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pending ? <p className="text-xs text-[#FFDDBB]">Сохраняем…</p> : null}
    </div>
  );
}

function LeadForm({ members }: { members: { id: string; name: string }[] }) {
  return (
    <form action={upsertLead} className="grid gap-2 rounded-2xl border border-[#2c2c32] bg-[#141416] p-4 md:grid-cols-6">
      <input name="brand" placeholder="Бренд" required />
      <input name="product" placeholder="Товар / услуга" />
      <select name="category" defaultValue="OTHER">
        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <select name="status" defaultValue="NO_REPLY">
        {Object.keys(LEAD_STATUS_COLORS).map((s) => (
          <option key={s} value={s}>
            {leadStatusLabel(s as LeadStatus)}
          </option>
        ))}
      </select>
      <select name="ownerId">
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <input name="links" placeholder="Ссылки / контакты" />
      <input name="comment" placeholder="Комментарий" className="md:col-span-5" />
      <button className="rounded-full bg-[#D5FF49] text-black">Добавить</button>
    </form>
  );
}
