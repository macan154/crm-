"use client";

import { useMemo, useState, useTransition } from "react";
import { updateSponsorship } from "@/lib/actions/sponsorships";
import { saveCustomFields, type CustomField } from "@/lib/actions/events";
import { uploadDocument } from "@/lib/actions/documents";
import { CATEGORY_LABELS, AD_FORMAT_LABELS, VK_POST_LABELS } from "@/lib/domain/labels";
import { formatMoney } from "@/lib/utils";
import { postSponsorshipToVk } from "@/lib/actions/integrations";

type Item = {
  id: string;
  finderName: string;
  category: string;
  product: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  total: number;
  links: string;
  hasLogo: boolean;
  hasPostText: boolean;
  adFormat: string;
  vkPostStatus: string;
  guestName: string;
  needsTable: boolean;
  isJury: boolean;
  customValues: Record<string, string>;
  progress: number;
};

export function SponsorsTable({
  items,
  customFields,
  eventId,
  role,
}: {
  items: Item[];
  customFields: CustomField[];
  eventId: string | null;
  role: string;
  members: { id: string; name: string }[];
}) {
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const visible = useMemo(
    () => items.filter((i) => `${i.brand} ${i.product} ${i.finderName}`.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );
  const sum = visible.reduce((acc, i) => acc + i.total, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input className="max-w-xs" placeholder="Фильтр" value={q} onChange={(e) => setQ(e.target.value)} />
        {eventId && role !== "VIEWER" ? (
          <form
            className="flex gap-2"
            action={async (fd) => {
              const name = String(fd.get("name") ?? "");
              if (!name) return;
              await saveCustomFields(eventId, [
                ...customFields,
                { id: crypto.randomUUID(), name, type: String(fd.get("type") ?? "text") as CustomField["type"] },
              ]);
            }}
          >
            <input name="name" placeholder="Новый столбец" />
            <select name="type">
              <option value="text">текст</option>
              <option value="number">число</option>
              <option value="bool">да/нет</option>
              <option value="file">файл</option>
            </select>
            <button className="rounded-full bg-[#DEBAFF] px-3 text-black">Добавить столбец</button>
          </form>
        ) : null}
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Кто нашёл</th>
              <th>Направление</th>
              <th>Продукт</th>
              <th>Бренд</th>
              <th>Цена</th>
              <th>Кол-во</th>
              <th>Сумма</th>
              <th>Материалы</th>
              <th>Формат рекламы</th>
              <th>Пост VK</th>
              <th>ФИО</th>
              <th>Стол</th>
              <th>Жюри</th>
              <th>Прогресс</th>
              {customFields.map((f) => (
                <th key={f.id}>{f.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.id}>
                <td>{item.finderName}</td>
                <td>{CATEGORY_LABELS[item.category]}</td>
                <td>{item.product}</td>
                <td>{item.brand}</td>
                <td>
                  <input
                    className="w-24"
                    defaultValue={item.unitPrice}
                    onBlur={(e) => start(async () => { await updateSponsorship(item.id, { unitPrice: e.target.value }); })}
                  />
                </td>
                <td>
                  <input
                    className="w-16"
                    defaultValue={item.quantity}
                    onBlur={(e) => start(async () => { await updateSponsorship(item.id, { quantity: e.target.value }); })}
                  />
                </td>
                <td>{formatMoney(item.total)}</td>
                <td>
                  <label className="mr-2">
                    <input
                      type="checkbox"
                      defaultChecked={item.hasLogo}
                      onChange={(e) => start(async () => { await updateSponsorship(item.id, { hasLogo: e.target.checked }); })}
                    />{" "}
                    лого
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      defaultChecked={item.hasPostText}
                      onChange={(e) => start(async () => { await updateSponsorship(item.id, { hasPostText: e.target.checked }); })}
                    />{" "}
                    текст
                  </label>
                </td>
                <td>
                  <select
                    defaultValue={item.adFormat}
                    onChange={(e) => start(async () => { await updateSponsorship(item.id, { adFormat: e.target.value }); })}
                  >
                    {Object.entries(AD_FORMAT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    defaultValue={item.vkPostStatus}
                    onChange={(e) => start(async () => { await updateSponsorship(item.id, { vkPostStatus: e.target.value }); })}
                  >
                    {Object.entries(VK_POST_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <button
                    className="mt-1 block text-xs text-[#B477ED]"
                    onClick={() =>
                      start(async () => {
                        const result = await postSponsorshipToVk(item.id, "Партнёр «{event}»: {brand}. {product}");
                        if (!result.ok && result.copy) await navigator.clipboard.writeText(result.copy);
                        alert(result.ok ? `Пост: ${result.url}` : `${result.error}\nТекст скопирован.`);
                      })
                    }
                  >
                    опубликовать
                  </button>
                </td>
                <td>
                  <input
                    defaultValue={item.guestName}
                    onBlur={(e) => start(async () => { await updateSponsorship(item.id, { guestName: e.target.value }); })}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    defaultChecked={item.needsTable}
                    onChange={(e) => start(async () => { await updateSponsorship(item.id, { needsTable: e.target.checked }); })}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    defaultChecked={item.isJury}
                    onChange={(e) => start(async () => { await updateSponsorship(item.id, { isJury: e.target.checked }); })}
                  />
                </td>
                <td>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-[#2c2c32]">
                    <div className="h-full bg-[#D5FF49]" style={{ width: `${item.progress}%` }} />
                  </div>
                </td>
                {customFields.map((field) => (
                  <td key={field.id}>
                    {field.type === "file" ? (
                      <form
                        action={async (fd) => {
                          fd.set("sponsorshipId", item.id);
                          fd.set("fieldKey", field.id);
                          fd.set("title", `${item.brand} · ${field.name}`);
                          fd.set("category", "COMMERCIAL");
                          await uploadDocument(fd);
                        }}
                      >
                        <input type="file" name="file" />
                        <button className="text-xs">загрузить</button>
                      </form>
                    ) : field.type === "bool" ? (
                      <input
                        type="checkbox"
                        defaultChecked={item.customValues[field.id] === "true"}
                        onChange={(e) =>
                          start(async () => {
                            await updateSponsorship(item.id, {
                              customValues: { ...item.customValues, [field.id]: String(e.target.checked) },
                            });
                          })
                        }
                      />
                    ) : (
                      <input
                        defaultValue={item.customValues[field.id] ?? ""}
                        onBlur={(e) =>
                          start(async () => {
                            await updateSponsorship(item.id, {
                              customValues: { ...item.customValues, [field.id]: e.target.value },
                            });
                          })
                        }
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[#D5FF49]">Итоговая сумма: {formatMoney(sum)}</p>
      {pending ? <p className="text-xs text-[#FFDDBB]">Сохраняем…</p> : null}
    </div>
  );
}
