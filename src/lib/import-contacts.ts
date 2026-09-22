import ExcelJS from "exceljs";

export type ImportedContact = {
  brand: string;
  personName?: string;
  position?: string;
  category?: string;
  vk?: string;
  telegram?: string;
  whatsapp?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

const CATEGORY_MAP: Record<string, string> = {
  еда: "FOOD",
  бьюти: "BEAUTY",
  развлечения: "ENTERTAINMENT",
  украшения: "JEWELRY",
  игрушки: "TOYS",
  одежда: "CLOTHING",
  "ручные изделия": "HANDMADE",
  другое: "OTHER",
  food: "FOOD",
  beauty: "BEAUTY",
};

export async function parseContactsExcel(buffer: ArrayBuffer): Promise<ImportedContact[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const sheet = wb.worksheets[0];
  if (!sheet) return [];
  const header: string[] = [];
  sheet.getRow(1).eachCell((cell, col) => {
    header[col] = String(cell.value ?? "")
      .trim()
      .toLowerCase();
  });
  const rows: ImportedContact[] = [];
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const get = (...aliases: string[]) => {
      const col = header.findIndex((h) => aliases.includes(h));
      if (col <= 0) return undefined;
      const raw = row.getCell(col).value;
      return raw == null ? undefined : String(raw);
    };
    const brand = get("бренд", "организация", "brand", "название бренда") ?? "";
    if (!brand.trim()) return;
    const categoryRaw = get("направление", "категория", "category")?.toLowerCase();
    rows.push({
      brand: brand.trim(),
      personName: get("фио", "контакт", "person", "фио контактного лица"),
      position: get("должность", "position"),
      category: categoryRaw ? CATEGORY_MAP[categoryRaw] ?? "OTHER" : "OTHER",
      vk: get("vk", "вк"),
      telegram: get("telegram", "телеграм"),
      whatsapp: get("whatsapp", "wa"),
      email: get("email", "почта", "e-mail"),
      phone: get("телефон", "phone"),
      notes: get("комментарий", "notes", "примечание"),
    });
  });
  return rows;
}
