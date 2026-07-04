import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type ExportTable = {
  title: string;
  headers: string[];
  rows: (string | number)[][];
};

export function buildExcel(table: ExportTable): Buffer {
  const worksheet = XLSX.utils.aoa_to_sheet([table.headers, ...table.rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, table.title.slice(0, 31));
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export async function buildPdf(table: ExportTable): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([842, 595]);
  const margin = 32;
  let y = 595 - margin;

  page.drawText(table.title, { x: margin, y, size: 16, font: bold, color: rgb(0.043, 0.365, 0.294) });
  y -= 28;

  const colCount = table.headers.length;
  const usableWidth = 842 - margin * 2;
  const colWidth = usableWidth / colCount;
  const fontSize = 8;
  const rowHeight = 16;

  const drawRow = (cells: (string | number)[], isHeader: boolean) => {
    const f = isHeader ? bold : font;
    if (isHeader) page.drawRectangle({ x: margin, y: y - 4, width: usableWidth, height: rowHeight, color: rgb(0.9, 0.94, 0.91) });
    cells.forEach((cell, i) => {
      const text = String(cell ?? "").slice(0, Math.floor(colWidth / 4.5));
      page.drawText(text, { x: margin + i * colWidth + 3, y, size: fontSize, font: f, color: rgb(0.08, 0.13, 0.11) });
    });
    y -= rowHeight;
  };

  drawRow(table.headers, true);
  for (const row of table.rows) {
    if (y < margin + rowHeight) {
      page = doc.addPage([842, 595]);
      y = 595 - margin;
      drawRow(table.headers, true);
    }
    drawRow(row, false);
  }

  return doc.save();
}

export function fileResponse(
  data: Buffer | Uint8Array,
  filename: string,
  format: "excel" | "pdf"
) {
  const contentType =
    format === "excel"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "application/pdf";
  return new Response(data as any, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}.${format === "excel" ? "xlsx" : "pdf"}"`,
    },
  });
}
