import { ClassicLayout } from "./classic/layout";
import { ModernLayout } from "./modern/layout";
import { MinimalLayout } from "./minimal/layout";
import type { InvoiceTemplate } from "./types";

export type {
  InvoiceTemplate,
  InvoiceTemplateMeta,
  InvoiceTemplateProps,
  InvoicePdfContext,
  InvoicePdfRenderer,
  UiTheme,
  PdfTheme,
} from "./types";

/**
 * The "Classic" template — the design the app shipped with. It stays the
 * default and the visual baseline: any new template is measured against it.
 */
const classic: InvoiceTemplate = {
  id: "classic",
  name: "Classic",
  description: "Clean single page with a dark header bar.",
  accent: "foreground",
  fontFamily: '"Geist", "Arial", sans-serif',
  headerStyle: "bar",
  Layout: ClassicLayout,
  loadPdfRenderer: () => import("./classic/pdf").then((m) => m.renderClassicPdf),
};

const modern: InvoiceTemplate = {
  id: "modern",
  name: "Modern",
  description: "Colored accent band and section labels.",
  accent: "primary",
  fontFamily: '"Geist", "Arial", sans-serif',
  headerStyle: "band",
  Layout: ModernLayout,
  loadPdfRenderer: () => import("./modern/pdf").then((m) => m.renderModernPdf),
};

const minimal: InvoiceTemplate = {
  id: "minimal",
  name: "Minimal",
  description: "Serif headings, hairline rules, lots of whitespace.",
  accent: "foreground",
  fontFamily: '"Geist", "Arial", sans-serif',
  headerStyle: "rule",
  Layout: MinimalLayout,
  loadPdfRenderer: () => import("./minimal/pdf").then((m) => m.renderMinimalPdf),
};

/**
 * Template registry. Add a template by dropping a folder under `templates/`
 * and registering it here — the editor and the PDF exporter pick it up with
 * no further changes.
 */
export const invoiceTemplates: Record<string, InvoiceTemplate> = {
  [classic.id]: classic,
  [modern.id]: modern,
  [minimal.id]: minimal,
};

/** Template used when none is selected or an unknown id is stored. */
export const DEFAULT_TEMPLATE_ID = classic.id;

/** Ordered list for the style picker UI. */
export const invoiceTemplateList: InvoiceTemplate[] = Object.values(invoiceTemplates);

/** Resolves a template id to its definition, falling back to the default. */
export function getInvoiceTemplate(id: string | undefined): InvoiceTemplate {
  return (id ? invoiceTemplates[id] : undefined) ?? classic;
}
