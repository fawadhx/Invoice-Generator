import { renderInvoicePdf } from "../shared/pdf";
import type { InvoicePdfContext, PdfTheme } from "../types";

/** Monochrome, filled dark header — the original PDF look, unchanged. */
const classicPdf: PdfTheme = {
  headingFont: "helvetica",
  accent: null,
  invoiceBand: false,
  tableHeadHairline: false,
  tableHeadFill: [24, 24, 27],
};

export const renderClassicPdf = (ctx: InvoicePdfContext) => renderInvoicePdf(ctx, classicPdf);
