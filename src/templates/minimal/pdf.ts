import { renderInvoicePdf } from "../shared/pdf";
import type { InvoicePdfContext, PdfTheme } from "../types";

/**
 * Monochrome with a serif (Times) heading face. "INVOICE" is plain text, the
 * table header is a hairline rule and rows get light bottom borders instead
 * of striped fills.
 */
const minimalPdf: PdfTheme = {
  headingFont: "times",
  accent: null,
  invoiceBand: false,
  tableHeadHairline: true,
  tableHeadFill: [24, 24, 27],
};

export const renderMinimalPdf = (ctx: InvoicePdfContext) => renderInvoicePdf(ctx, minimalPdf);
