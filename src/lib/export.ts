import ExcelJS from "exceljs";

export async function rowsToExcel(sheetName: string, rows: Record<string, unknown>[]) {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet(sheetName);
  if (!rows.length) {
    sheet.addRow(["Нет данных"]);
  } else {
    const keys = Object.keys(rows[0]);
    sheet.addRow(keys);
    for (const row of rows) sheet.addRow(keys.map((k) => stringify(row[k])));
    sheet.getRow(1).font = { bold: true };
  }
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function rowsToCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "\uFEFF";
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(";"), ...rows.map((row) => keys.map((k) => csvCell(stringify(row[k]))).join(";"))];
  return `\uFEFF${lines.join("\n")}`;
}

function stringify(value: unknown) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function csvCell(value: string) {
  if (/[;"\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}
