import autoTable from "jspdf-autotable";
import type { InvoicePdfContext, PdfTheme } from "../types";

/**
 * Draws the invoice into a jsPDF document. The layout and coordinates are
 * shared by every template; `theme` varies the finish (heading font, accent
 * color, whether "INVOICE" sits in a filled band, whether the table header
 * is a filled bar or a hairline rule) so the PDF matches whatever template
 * is shown on screen.
 *
 * With a monochrome `theme` (no accent, filled dark header, helvetica) this
 * reproduces the original single-style exporter exactly.
 */
export async function renderInvoicePdf(
  { doc, inv, totals, pageWidth, pageHeight, margin: MARGIN, money, logoAsPng }: InvoicePdfContext,
  theme: PdfTheme,
): Promise<void> {
  const right = pageWidth - MARGIN;
  const heading = theme.headingFont;
  /** Sets the fill/text color for a section label — accent when the theme has one. */
  const setLabelColor = () => {
    if (theme.accent) doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
    else doc.setTextColor(130);
  };

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
    doc.setFont(heading, "bold");
    doc.setFontSize(16);
    doc.setTextColor(20);
    const lines = doc.splitTextToSize(inv.business.trim(), pageWidth / 2 - MARGIN);
    doc.text(lines, MARGIN, leftY + 12);
    leftY += lines.length * 18 + 4;
  }
  if (inv.address.trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110);
    const lines = doc.splitTextToSize(inv.address.trim(), pageWidth / 2 - MARGIN);
    doc.text(lines, MARGIN, leftY + 11);
    leftY += lines.length * 11 + 4;
  }

  // ---- Header: INVOICE (right) ----
  if (theme.invoiceBand && theme.accent) {
    doc.setFont(heading, "bold");
    doc.setFontSize(20);
    const textW = doc.getTextWidth("INVOICE");
    const padX = 12;
    const padY = 8;
    const bandW = textW + padX * 2;
    const bandH = 20 + padY * 2;
    const bandX = right - bandW;
    const bandY = MARGIN - 8;
    doc.setFillColor(theme.accent[0], theme.accent[1], theme.accent[2]);
    doc.rect(bandX, bandY, bandW, bandH, "F");
    doc.setTextColor(255);
    doc.text("INVOICE", right - padX, bandY + padY + 15, { align: "right" });
  } else {
    doc.setFont(heading, "bold");
    doc.setFontSize(26);
    doc.setTextColor(140);
    doc.text("INVOICE", right, MARGIN + 8, { align: "right" });
  }

  // ---- Header: meta (right) ----
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
  const partyBlock = (body: string, phone: string) =>
    [body.trim(), phone.trim() && `Phone: ${phone.trim()}`].filter(Boolean).join("\n") || "—";
  (
    [
      ["Bill from", partyBlock(inv.from, inv.fromPhone)],
      ["Bill to", partyBlock(inv.to, inv.toPhone)],
    ] as Array<[string, string]>
  ).forEach(([label, value], idx) => {
    const x = MARGIN + idx * (colW + colGap);
    doc.setFont(heading, "bold");
    setLabelColor();
    doc.text(label.toUpperCase(), x, cursorY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40);
    const lines = doc.splitTextToSize(value.trim() || "—", colW);
    doc.text(lines, x, cursorY + 13);
    partyY = Math.max(partyY, cursorY + 13 + lines.length * 11);
  });

  if (inv.shipTo.trim()) {
    partyY += 12;
    doc.setFont(heading, "bold");
    setLabelColor();
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
    theme: theme.tableHeadHairline ? "plain" : "striped",
    styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak" },
    headStyles: theme.tableHeadHairline
      ? {
          fillColor: false,
          textColor: [90, 90, 90],
          fontStyle: "bold",
          halign: "left",
          lineWidth: { bottom: 0.75 },
          lineColor: [40, 40, 40],
        }
      : { fillColor: theme.tableHeadFill, textColor: 255, halign: "left" },
    bodyStyles: theme.tableHeadHairline
      ? { lineWidth: { bottom: 0.5 }, lineColor: [225, 225, 225] }
      : {},
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
      if (theme.accent) {
        doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]);
        doc.setLineWidth(1);
      } else {
        doc.setDrawColor(24);
        doc.setLineWidth(0.8);
      }
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
    doc.setFont(heading, "bold");
    doc.setFontSize(9);
    setLabelColor();
    doc.text("NOTES", MARGIN, ny);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50);
    const lines = doc.splitTextToSize(inv.notes.trim(), pageWidth - MARGIN * 2);
    doc.text(lines, MARGIN, ny + 14);
  }
}
