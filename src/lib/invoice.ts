export type InvoiceItem = { id: number; name: string; qty: number; rate: number };

export type Invoice = {
  /**
   * @deprecated The logo now comes from the saved Company Profile
   * (`profile.logo`), read directly by the document and the PDF. This field is
   * retained only so older invoices persisted in localStorage still parse.
   */
  logo?: string;
  business: string;
  /**
   * Business address, shown under the business name in the header (on screen
   * and in the PDF). Auto-filled from the saved Company Profile on a blank
   * invoice; editable inline without writing back to the profile.
   */
  address: string;
  from: string;
  fromPhone: string;
  to: string;
  toPhone: string;
  shipTo: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  terms: string;
  items: InvoiceItem[];
  taxPercent: number;
  discount: number;
  amountPaid: number;
  notes: string;
  /**
   * ISO currency code, kept in sync from the Company Profile (which owns all
   * currency & format settings — there is no per-invoice picker). Money is
   * *displayed* via the profile's `currencyDisplay` + `numberFormat`, not
   * from this code directly; it is retained for saved-invoice data hygiene.
   */
  currency: string;
  /**
   * Id of the visual template used to render the invoice on screen and in the
   * exported PDF (see `src/templates`). The invoice data is template-agnostic;
   * this is the only field that decides how it looks.
   */
  selectedTemplate: string;
};

export type InvoiceTotals = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  /** Total − Amount paid. Negative means the client has overpaid (a credit). */
  balance: number;
};

const num = (v: number) => (Number.isFinite(v) ? v : 0);

/**
 * Derives every money figure on the invoice from the line items and the
 * tax / discount / amount-paid inputs. Balance due is always
 * `total − amountPaid` — it is never entered directly. When the client has
 * paid more than the total, the balance goes negative to show the credit.
 */
export function computeTotals(inv: Invoice): InvoiceTotals {
  const subtotal = inv.items.reduce((sum, i) => sum + num(i.qty) * num(i.rate), 0);
  const tax = subtotal * (num(inv.taxPercent) / 100);
  const discount = num(inv.discount);
  const total = subtotal + tax - discount;
  const amountPaid = num(inv.amountPaid);
  return { subtotal, tax, discount, total, amountPaid, balance: total - amountPaid };
}
