import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  computeTotals,
  formatInvoiceMoney,
  type Invoice,
  type InvoiceItem as Item,
} from "@/lib/invoice";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const today = new Date();
const due = new Date(today);
due.setDate(today.getDate() + 14);

const initial: Invoice = {
  business: "",
  from: "",
  to: "",
  shipTo: "",
  invoiceNo: "1",
  date: iso(today),
  dueDate: iso(due),
  terms: "Net 14",
  items: [{ id: 1, name: "", qty: 1, rate: 0 }],
  taxPercent: 0,
  discount: 0,
  amountPaid: 0,
  notes: "",
  currency: "USD",
};

const money = formatInvoiceMoney;

const cell =
  "w-full rounded-sm border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground hover:border-border focus:border-primary focus:bg-card";

export function InvoiceEditor() {
  const [inv, setInv] = useState<Invoice>(initial);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("rapidai-invoice");
    if (!stored) return;
    try {
      setInv((current) => ({ ...current, ...JSON.parse(stored) }));
    } catch {
      /* ignore corrupt data */
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(
      () => localStorage.setItem("rapidai-invoice", JSON.stringify(inv)),
      400,
    );
    return () => window.clearTimeout(timer);
  }, [inv]);

  const patch = (values: Partial<Invoice>) => setInv((c) => ({ ...c, ...values }));
  const setItem = (id: number, key: keyof Item, value: string) =>
    patch({
      items: inv.items.map((i) =>
        i.id === id ? { ...i, [key]: key === "name" ? value : Number(value) } : i,
      ),
    });
  const onLogo = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patch({ logo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  // Balance due is always derived — Total − Amount paid — and is never stored
  // as its own editable value. Recomputed whenever any line item, tax,
  // discount or amount paid changes. If the client overpays, the balance
  // shows as a negative "credit" amount.
  const totals = useMemo(() => computeTotals(inv), [inv]);
  const { subtotal, tax, total, balance } = totals;

  const handleDownload = async () => {
    setDownloadError(null);
    setDownloading(true);
    try {
      const { generateInvoicePdf } = await import("@/lib/invoice-pdf");
      await generateInvoicePdf(inv, totals);
    } catch (err) {
      console.error("Invoice PDF generation failed", err);
      setDownloadError("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="border-b border-border bg-card print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 px-4 py-3 lg:px-6">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            Currency
            <select
              className="h-9 rounded-sm border border-border bg-card px-2 text-sm text-foreground"
              value={inv.currency}
              onChange={(e) => patch({ currency: e.target.value })}
            >
              {["USD", "EUR", "GBP", "CAD", "AUD", "PKR", "INR"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 lg:flex-row lg:px-6">
        <article
          id="invoice-sheet"
          className="min-w-0 flex-1 border border-border bg-card p-6 shadow-sheet sm:p-10"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onLogo(e.target.files?.[0])}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="mb-4 flex h-20 w-40 items-center justify-center gap-2 rounded-sm border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary print:hidden"
              >
                {inv.logo ? (
                  <img
                    src={inv.logo}
                    alt="Business logo"
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Add your logo
                  </>
                )}
              </button>
              {inv.logo && (
                <img
                  src={inv.logo}
                  alt="Business logo"
                  className="mb-4 hidden h-20 object-contain object-left print:block"
                />
              )}
              <input
                className={`${cell} text-lg font-semibold`}
                placeholder="Your business name"
                value={inv.business}
                onChange={(e) => patch({ business: e.target.value })}
              />
            </div>
            <div className="w-full sm:w-64">
              <div className="mb-2 text-center text-4xl font-semibold tracking-tight text-muted-foreground sm:text-right">
                INVOICE
              </div>
              <div className="flex items-center justify-center gap-1 sm:justify-end">
                <span className="text-xs font-medium text-muted-foreground">#</span>
                <input
                  style={{ fieldSizing: "content" }}
                  className="rounded-sm border border-transparent bg-transparent py-1.5 px-0 text-sm outline-none hover:border-border focus:border-primary focus:bg-card text-right"
                  value={inv.invoiceNo}
                  onChange={(e) => patch({ invoiceNo: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <Block label="Bill from">
                <textarea
                  className={`${cell} min-h-16 resize-none`}
                  placeholder="Name, address, email"
                  value={inv.from}
                  onChange={(e) => patch({ from: e.target.value })}
                />
              </Block>
              <Block label="Bill to">
                <textarea
                  className={`${cell} min-h-16 resize-none`}
                  placeholder="Who is this invoice to?"
                  value={inv.to}
                  onChange={(e) => patch({ to: e.target.value })}
                />
              </Block>
              <Block label="Ship to">
                <textarea
                  className={`${cell} min-h-12 resize-none`}
                  placeholder="(optional)"
                  value={inv.shipTo}
                  onChange={(e) => patch({ shipTo: e.target.value })}
                />
              </Block>
            </div>
            <div className="space-y-2 sm:pl-6">
              <Row label="Date">
                <input
                  type="date"
                  className={`${cell} text-right`}
                  value={inv.date}
                  onChange={(e) => patch({ date: e.target.value })}
                />
              </Row>
              <Row label="Payment terms">
                <input
                  className={`${cell} text-right`}
                  value={inv.terms}
                  onChange={(e) => patch({ terms: e.target.value })}
                />
              </Row>
              <Row label="Due date">
                <input
                  type="date"
                  className={`${cell} text-right`}
                  value={inv.dueDate}
                  onChange={(e) => patch({ dueDate: e.target.value })}
                />
              </Row>
              <Row label="Balance due">
                <span className="block px-2 py-1.5 text-right text-sm font-semibold">
                  {money(balance, inv.currency)}
                </span>
              </Row>
            </div>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-[1fr_60px_88px_88px_28px] gap-2 rounded-sm bg-foreground px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-background">
              <span>Item</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
              <span />
            </div>
            {inv.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_60px_88px_88px_28px] items-center gap-2 border-b border-border py-1"
              >
                <input
                  className={cell}
                  placeholder="Description of service or item"
                  value={item.name}
                  onChange={(e) => setItem(item.id, "name", e.target.value)}
                />
                <input
                  type="number"
                  min={0}
                  aria-label="Quantity"
                  className={`${cell} text-right`}
                  value={item.qty}
                  onChange={(e) => setItem(item.id, "qty", e.target.value)}
                />
                <input
                  type="number"
                  min={0}
                  aria-label="Rate"
                  className={`${cell} text-right`}
                  value={item.rate}
                  onChange={(e) => setItem(item.id, "rate", e.target.value)}
                />
                <span className="px-2 text-right text-sm">
                  {money(item.qty * item.rate, inv.currency)}
                </span>
                <button
                  aria-label="Remove line"
                  onClick={() => patch({ items: inv.items.filter((i) => i.id !== item.id) })}
                  className="text-muted-foreground hover:text-destructive print:hidden"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-3 print:hidden"
              onClick={() =>
                patch({ items: [...inv.items, { id: Date.now(), name: "", qty: 1, rate: 0 }] })
              }
            >
              <Plus /> Line item
            </Button>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <Block label="Notes">
              <textarea
                className={`${cell} min-h-20 resize-none`}
                placeholder="Notes or terms — e.g. bank details, late fees"
                value={inv.notes}
                onChange={(e) => patch({ notes: e.target.value })}
              />
            </Block>
            <div className="space-y-2 text-sm">
              <Row label="Subtotal">
                <span className="block px-2 py-1.5 text-right">
                  {money(subtotal, inv.currency)}
                </span>
              </Row>
              <Row label="Tax (%)">
                <input
                  type="number"
                  min={0}
                  className={`${cell} text-right`}
                  value={inv.taxPercent}
                  onChange={(e) => patch({ taxPercent: Number(e.target.value) })}
                />
              </Row>
              <Row label="Discount">
                <input
                  type="number"
                  min={0}
                  className={`${cell} text-right`}
                  value={inv.discount}
                  onChange={(e) => patch({ discount: Number(e.target.value) })}
                />
              </Row>
              <Row label="Total">
                <span className="block px-2 py-1.5 text-right font-semibold">
                  {money(total, inv.currency)}
                </span>
              </Row>
              <Row label="Amount paid">
                <input
                  type="number"
                  min={0}
                  className={`${cell} text-right`}
                  value={inv.amountPaid}
                  onChange={(e) => patch({ amountPaid: Number(e.target.value) })}
                />
              </Row>
              <div className="border-t border-foreground pt-2">
                <Row label="Balance due">
                  <span className="block px-2 py-1.5 text-right text-base font-bold">
                    {money(balance, inv.currency)}
                  </span>
                </Row>
              </div>
            </div>
          </div>
        </article>

        <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-6 lg:w-60 lg:self-start print:hidden">
          <Button size="lg" className="w-full" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2 className="animate-spin" /> Preparing PDF…
              </>
            ) : (
              <>
                <Download /> Download Invoice
              </>
            )}
          </Button>
          {downloadError && (
            <p className="text-xs leading-5 text-destructive" role="alert">
              {downloadError}
            </p>
          )}
          <div className="space-y-2 rounded-sm border border-border bg-card p-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                localStorage.removeItem("rapidai-invoice");
                setInv({ ...initial, items: [{ id: Date.now(), name: "", qty: 1, rate: 0 }] });
              }}
            >
              Clear invoice
            </Button>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            No signup. Your details are saved only in this browser.
          </p>
        </aside>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="w-32">{children}</div>
    </div>
  );
}
function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
