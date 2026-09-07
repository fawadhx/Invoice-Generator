import { renderInvoicePdf } from "../shared/pdf";
import type { InvoicePdfContext, PdfTheme } from "../types";

/**
 * Accent blue (~ the app's `--primary`). "INVOICE" gets a filled band,
 * labels and the totals rule use the same blue, table header stays filled.
 */
const modernPdf: PdfTheme = {
  headingFont: "helvetica",
  accent: [37, 99, 235],
  invoiceBand: true,
  tableHeadHairline: false,
  tableHeadFill: [37, 99, 235],
};

export const renderModernPdf = (ctx: InvoicePdfContext) => renderInvoicePdf(ctx, modernPdf);
