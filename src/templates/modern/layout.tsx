import { InvoiceDocument } from "../shared/invoice-document";
import type { InvoiceTemplateProps, UiTheme } from "../types";

/**
 * "Modern" — clean sans-serif with a colored accent. "INVOICE" sits in a
 * filled primary band; section labels and the totals divider pick up the
 * same accent. Spacing matches Classic.
 */
const modernUi: UiTheme = {
  sheet: "min-w-0 flex-1 border border-border bg-card p-6 shadow-sheet sm:p-10",
  headingFont: "",
  invoiceTitleWrap: "mb-2 flex justify-center sm:justify-end",
  invoiceTitleText:
    "rounded-sm bg-primary px-3 py-1.5 text-2xl font-bold uppercase tracking-wide text-primary-foreground",
  label: "text-xs font-semibold uppercase tracking-wide text-primary",
  partiesTop: "mt-8",
  itemsTop: "mt-10",
  summaryTop: "mt-8",
  tableHead:
    "rounded-sm bg-primary px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground",
  itemRow: "border-b border-border py-1",
  totalsDivider: "border-t-2 border-primary pt-2",
};

export function ModernLayout(props: InvoiceTemplateProps) {
  return <InvoiceDocument {...props} theme={modernUi} />;
}
