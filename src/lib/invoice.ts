export type InvoiceItem = { id: number; name: string; qty: number; rate: number };

export type Invoice = {
  logo?: string;
  business: string;
  from: string;
  to: string;
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
  currency: string;
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

/** On-screen currency formatting — uses the local symbol (e.g. `$1,200.00`). */
export function formatInvoiceMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(num(value));
}

/**
 * Currency formatting for the PDF. Uses the ISO code (e.g. `USD 1,200.00`)
 * because the standard PDF fonts cannot render every currency symbol
 * (₹, ₨ and others render as blank boxes).
 */
export function formatPdfMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(num(value));
}
