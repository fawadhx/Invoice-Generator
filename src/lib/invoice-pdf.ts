import { jsPDF } from "jspdf";
import { getInvoiceTemplate } from "@/templates";
import type { Invoice, InvoiceTotals } from "./invoice";
import { DEFAULT_FORMAT_PREFS, formatDate, formatMoney, type FormatPrefs } from "./locale-format";

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
 * Re-encodes any uploaded image — logo or signature (png/jpeg/webp/gif/…) —
 * to a PNG data URL so jsPDF can embed it regardless of the original format.
 * Returns null if the image cannot be decoded or has no intrinsic size.
 */
async function imageAsPng(
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
 *
 * `prefs` is the currency / date / number formatting from the saved Company
 * Profile — the same object the on-screen document uses, so the PDF matches
 * exactly. Defaults to the app's original US-style formatting.
 *
 * `signatureUrl` is the saved Company Profile's signature (a data URL), or
 * `""` for none — passed straight through so every template's renderer can
 * draw the signature block in the same place it appears on screen.
 */
export async function generateInvoicePdf(
  inv: Invoice,
  totals: InvoiceTotals,
  prefs: FormatPrefs = DEFAULT_FORMAT_PREFS,
  signatureUrl = "",
): Promise<void> {
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
    money: (value: number) => formatMoney(value, prefs),
    date: (iso: string) => formatDate(iso, prefs.dateFormat),
    signatureUrl,
    imageAsPng,
  });

  doc.save(safeFileName(inv.invoiceNo));
}
