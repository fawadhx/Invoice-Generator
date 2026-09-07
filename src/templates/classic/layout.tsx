import { InvoiceDocument } from "../shared/invoice-document";
import type { InvoiceTemplateProps, UiTheme } from "../types";

/**
 * "Classic" — the design the app shipped with: clean single page, sans-serif
 * throughout, a dark header bar on the line-items table and a rule above the
 * balance due. This is the visual baseline; its `UiTheme` reproduces the
 * original markup exactly.
 */
const classicUi: UiTheme = {
  sheet: "min-w-0 flex-1 border border-border bg-card p-6 shadow-sheet sm:p-10",
  headingFont: "",
  invoiceTitleWrap: "mb-2 text-center sm:text-right",
  invoiceTitleText: "text-4xl font-semibold tracking-tight text-muted-foreground",
  label: "text-xs font-medium text-muted-foreground",
  partiesTop: "mt-8",
  itemsTop: "mt-10",
  summaryTop: "mt-8",
  tableHead:
    "rounded-sm bg-foreground px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-background",
  itemRow: "border-b border-border py-1",
  totalsDivider: "border-t border-foreground pt-2",
};

export function ClassicLayout(props: InvoiceTemplateProps) {
  return <InvoiceDocument {...props} theme={classicUi} />;
}
