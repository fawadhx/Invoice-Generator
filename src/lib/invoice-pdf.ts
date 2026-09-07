import { jsPDF } from "jspdf";
import { getInvoiceTemplate } from "@/templates";
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
 * print dialog.
 *
 * The actual drawing is delegated to the template selected on the invoice
 * (`inv.selectedTemplate`), so the exported PDF always matches whatever
 * template is shown on screen. Only the chosen template's renderer is
 * fetched (dynamic import), keeping jsPDF's drawing code out of the main
 * bundle. `totals` is the derived totals block; balance due is never passed
 * in as an editable value.
 */
export async function generateInvoicePdf(inv: Invoice, totals: InvoiceTotals): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const template = getInvoiceTemplate(inv.selectedTemplate);
  const renderPdf = await template.loadPdfRenderer();

  await renderPdf({
    doc,
    inv,
    totals,
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
    margin: MARGIN,
    money: (value: number) => formatPdfMoney(value, inv.currency),
    logoAsPng,
  });

  doc.save(safeFileName(inv.invoiceNo));
}
