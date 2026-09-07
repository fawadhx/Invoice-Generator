import { InvoiceDocument } from "../shared/invoice-document";
import type { InvoiceTemplateProps, UiTheme } from "../types";

/**
 * "Minimal" — serif headings, generous whitespace, monochrome. No accent
 * color anywhere; the line-items header is a hairline rule instead of a
 * filled bar, and row borders are lighter.
 */
const minimalUi: UiTheme = {
  sheet: "min-w-0 flex-1 border border-border bg-card p-8 shadow-sheet sm:p-14",
  headingFont: "font-serif",
  invoiceTitleWrap: "mb-2 text-center sm:text-right",
  invoiceTitleText: "font-serif text-4xl font-normal tracking-tight text-foreground",
  label: "text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground",
  partiesTop: "mt-12",
  itemsTop: "mt-14",
  summaryTop: "mt-12",
  tableHead:
    "border-b border-foreground px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground",
  itemRow: "border-b border-border/60 py-2",
  totalsDivider: "border-t border-foreground pt-2",
};

export function MinimalLayout(props: InvoiceTemplateProps) {
  return <InvoiceDocument {...props} theme={minimalUi} />;
}
