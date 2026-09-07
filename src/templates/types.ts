import type { ComponentType } from "react";
import type { jsPDF } from "jspdf";
import type { Invoice, InvoiceItem, InvoiceTotals } from "@/lib/invoice";

/**
 * Props every template layout receives.
 *
 * The invoice editor owns 100% of the state, the patch functions and the
 * money calculations. A template is a pure *view*: it renders the editable
 * invoice document (the `<input>`s live inside the layout, but the handlers
 * that mutate state are passed in from the editor). Adding a new template
 * must never require touching the editor.
 */
export type InvoiceTemplateProps = {
  /** The full invoice, single source of truth. */
  inv: Invoice;
  /** Derived money figures (subtotal, tax, total, balance…). */
  totals: InvoiceTotals;
  /** Merge a partial patch into the invoice. */
  patch: (values: Partial<Invoice>) => void;
  /** Update one field of one line item (value comes straight from the input). */
  setItem: (id: number, key: keyof InvoiceItem, value: string) => void;
  /** Append a fresh blank line item. */
  addItem: () => void;
  /** Remove the line item with this id. */
  removeItem: (id: number) => void;
  /** Handle a newly picked logo file. */
  onLogo: (file?: File) => void;
};

/**
 * Context handed to a template's PDF renderer. The generic document setup
 * (page geometry, currency formatting, logo decoding, filename, save) lives
 * in `src/lib/invoice-pdf.ts`; each template only draws its own design into
 * `doc`.
 */
export type InvoicePdfContext = {
  doc: jsPDF;
  inv: Invoice;
  totals: InvoiceTotals;
  pageWidth: number;
  pageHeight: number;
  /** Outer page margin in pt. */
  margin: number;
  /** Formats a number as PDF-safe currency (ISO code, e.g. `USD 1,200.00`). */
  money: (value: number) => string;
  /** Decodes any uploaded logo to a PNG data URL jsPDF can embed. */
  logoAsPng: (src: string) => Promise<{ url: string; width: number; height: number } | null>;
};

export type InvoicePdfRenderer = (ctx: InvoicePdfContext) => Promise<void>;

/** Static description of a template — safe to read anywhere, no components. */
export type InvoiceTemplateMeta = {
  id: string;
  name: string;
  /** One-line summary for the (future) style picker UI. */
  description: string;
  /** Design-system color token that drives the template's accent. */
  accent: string;
  /** CSS font-family stack the layout renders in. */
  fontFamily: string;
  /** Header treatment variant — an informational hook for future templates. */
  headerStyle: "bar" | "band" | "rule" | "plain";
};

export type InvoiceTemplate = InvoiceTemplateMeta & {
  /** Renders the editable invoice document. */
  Layout: ComponentType<InvoiceTemplateProps>;
  /**
   * Lazily loads this template's PDF drawing routine. Kept behind a dynamic
   * import so jsPDF and the per-template drawing code never enter the main
   * bundle — only the chosen template's renderer is fetched, on download.
   */
  loadPdfRenderer: () => Promise<InvoicePdfRenderer>;
};
