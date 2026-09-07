import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPdfMoney, type Invoice, type InvoiceTotals } from "./invoice";

const MARGIN = 40;

function safeFileName(invoiceNo: string): string {
  const cleaned = invoiceNo
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `invoice-${cleaned || "draft"}.pdf`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Logo image failed to load"));
    img.src = src;
  });
}

/**
 * Re-encodes any uploaded logo (png/jpeg/webp/gif/…) to a PNG data URL so
 * jsPDF can embed it regardless of the original format. Returns null if the
 * image cannot be decoded or has no intrinsic size.
 */
async function logoAsPng(
  src: string,
): Promise<{ url: string; width: number; height: number } | null> {
  try {
    const img = await loadImage(src);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) return null;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return { url: canvas.toDataURL("image/png"), width, height };
  } catch {
    return null;
  }
}

/**
 * Builds a single-page (auto-paginating) PDF that mirrors the on-screen
 * invoice and triggers a direct `invoice-{number}.pdf` download — no browser
 * print dialog. `totals` is the derived totals block; balance due is never
 * passed in as an editable value.
 */
export async function generateInvoicePdf(inv: Invoice, totals: InvoiceTotals): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const right = pageWidth - MARGIN;
  const money = (v: number) => formatPdfMoney(v, inv.currency);

  // ---- Header: logo + business name (left) ----
  let leftY = MARGIN;
  if (inv.logo) {
    const logo = await logoAsPng(inv.logo);
    if (logo) {
      const ratio = Math.min(150 / logo.width, 64 / logo.height, 1);
      const w = logo.width * ratio;
      const h = logo.height * ratio;
      try {
        doc.addImage(logo.url, "PNG", MARGIN, leftY, w, h);
        leftY += h + 12;
      } catch {
        /* skip an image jsPDF still refuses */
      }
    }
  }
  if (inv.business.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(20);
    const lines = doc.splitTextToSize(inv.business.trim(), pageWidth / 2 - MARGIN);
    doc.text(lines, MARGIN, leftY + 12);
    leftY += lines.length * 18 + 4;
  }

  // ---- Header: INVOICE + meta (right) ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(140);
  doc.text("INVOICE", right, MARGIN + 8, { align: "right" });

  const meta: Array<[string, string]> = [
    ["Invoice #", inv.invoiceNo || "—"],
    ["Date", inv.date || "—"],
    ["Payment terms", inv.terms || "—"],
    ["Due date", inv.dueDate || "—"],
  ];
  doc.setFontSize(10);
  let metaY = MARGIN + 32;
  for (const [label, value] of meta) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130);
    doc.text(label, right - 170, metaY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60);
    doc.text(value, right, metaY, { align: "right" });
    metaY += 15;
  }

  let cursorY = Math.max(leftY, metaY) + 18;

  // ---- Parties ----
  const colGap = 20;
  const colW = (pageWidth - MARGIN * 2 - colGap) / 2;
  let partyY = cursorY;
  doc.setFontSize(9);
  (
    [
      ["Bill from", inv.from],
      ["Bill to", inv.to],
    ] as Array<[string, string]>
  ).forEach(([label, value], idx) => {
    const x = MARGIN + idx * (colW + colGap);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(130);
    doc.text(label.toUpperCase(), x, cursorY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40);
    const lines = doc.splitTextToSize(value.trim() || "—", colW);
    doc.text(lines, x, cursorY + 13);
    partyY = Math.max(partyY, cursorY + 13 + lines.length * 11);
  });

  if (inv.shipTo.trim()) {
    partyY += 12;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(130);
    doc.text("SHIP TO", MARGIN, partyY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40);
    const lines = doc.splitTextToSize(inv.shipTo.trim(), pageWidth - MARGIN * 2);
    doc.text(lines, MARGIN, partyY + 13);
    partyY += 13 + lines.length * 11;
  }

  cursorY = partyY + 22;

  // ---- Line items ----
  let tableEndY = cursorY;
  autoTable(doc, {
    startY: cursorY,
    head: [["Item", "Qty", "Rate", "Amount"]],
    body: inv.items.map((i) => {
      const qty = Number.isFinite(i.qty) ? i.qty : 0;
      const rate = Number.isFinite(i.rate) ? i.rate : 0;
      return [i.name.trim() || "—", String(qty), money(rate), money(qty * rate)];
    }),
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak" },
    headStyles: { fillColor: [24, 24, 27], textColor: 255, halign: "left" },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", cellWidth: 46 },
      2: { halign: "right", cellWidth: 84 },
      3: { halign: "right", cellWidth: 92 },
    },
    didDrawPage: (data) => {
      if (data.cursor) tableEndY = data.cursor.y;
    },
  });
  const lastTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  let y = (lastTable?.finalY ?? tableEndY) + 22;

  // ---- Totals ----
  const totalRows: Array<{ label: string; value: string; strong?: boolean }> = [
    { label: "Subtotal", value: money(totals.subtotal) },
    {
      label: `Tax (${Number.isFinite(inv.taxPercent) ? inv.taxPercent : 0}%)`,
      value: money(totals.tax),
    },
    { label: "Discount", value: `- ${money(totals.discount)}` },
    { label: "Total", value: money(totals.total) },
    { label: "Amount paid", value: `- ${money(totals.amountPaid)}` },
    { label: "Balance due", value: money(totals.balance), strong: true },
  ];
  const labelX = right - 210;
  if (y > pageHeight - MARGIN - totalRows.length * 17 - 30) {
    doc.addPage();
    y = MARGIN;
  }
  for (const row of totalRows) {
    if (row.strong) {
      y += 5;
      doc.setDrawColor(24);
      doc.setLineWidth(0.8);
      doc.line(labelX, y - 7, right, y - 7);
    }
    doc.setFont("helvetica", row.strong ? "bold" : "normal");
    doc.setFontSize(row.strong ? 12 : 10);
    doc.setTextColor(row.strong ? 20 : 70);
    doc.text(row.label, labelX, y + 6);
    doc.text(row.value, right, y + 6, { align: "right" });
    y += row.strong ? 20 : 16;
  }

  // ---- Notes ----
  if (inv.notes.trim()) {
    let ny = y + 26;
    if (ny > pageHeight - MARGIN - 50) {
      doc.addPage();
      ny = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(130);
    doc.text("NOTES", MARGIN, ny);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50);
    const lines = doc.splitTextToSize(inv.notes.trim(), pageWidth - MARGIN * 2);
    doc.text(lines, MARGIN, ny + 14);
  }

  doc.save(safeFileName(inv.invoiceNo));
}
