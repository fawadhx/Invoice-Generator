import { ClassicLayout } from "./classic/layout";
import type { InvoiceTemplate } from "./types";

export type {
  InvoiceTemplate,
  InvoiceTemplateMeta,
  InvoiceTemplateProps,
  InvoicePdfContext,
  InvoicePdfRenderer,
} from "./types";

/**
 * The "Classic" template — the design the app shipped with. It stays the
 * default and the visual baseline: any new template is measured against it.
 */
const classic: InvoiceTemplate = {
  id: "classic",
  name: "Classic",
  description:
    "The original layout — clean single page, sans-serif throughout, dark header bar on the items table.",
  accent: "foreground",
  fontFamily: '"Geist", "Arial", sans-serif',
  headerStyle: "bar",
  Layout: ClassicLayout,
  loadPdfRenderer: () => import("./classic/pdf").then((m) => m.renderClassicPdf),
};

/**
 * Template registry. Add a template by dropping a folder under `templates/`
 * and registering it here — the editor and the PDF exporter pick it up with
 * no further changes.
 */
export const invoiceTemplates: Record<string, InvoiceTemplate> = {
  [classic.id]: classic,
};

/** Template used when none is selected or an unknown id is stored. */
export const DEFAULT_TEMPLATE_ID = classic.id;

/** Ordered list for the (future) style picker UI. */
export const invoiceTemplateList: InvoiceTemplate[] = Object.values(invoiceTemplates);

/** Resolves a template id to its definition, falling back to the default. */
export function getInvoiceTemplate(id: string | undefined): InvoiceTemplate {
  return (id ? invoiceTemplates[id] : undefined) ?? classic;
}
