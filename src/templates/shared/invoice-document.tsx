import { useRef, type ReactNode } from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bankingFieldRows, hasBankingDetails } from "@/lib/company-profile";
import type { InvoiceTemplateProps, UiTheme } from "../types";

// Shared affordance class defined in styles.css (@layer components).
// Extra utilities (text-right, min-h-*, resize-none, font weight) are
// appended per field where needed.
const cell = "editable-field";

type Props = InvoiceTemplateProps & { theme: UiTheme };

/**
 * The one editable invoice document, shared by every template. The markup —
 * and therefore the set of editable fields and the `editable-field`
 * affordance on each — is identical across templates; the `theme` prop is
 * the only thing that varies the look. Add a field here once and every
 * template gets it.
 */
export function InvoiceDocument({
  inv,
  totals,
  patch,
  setItem,
  addItem,
  removeItem,
  onLogo,
  onEditProfile,
  formatMoney: money,
  signatureUrl,
  banking,
  theme: t,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { subtotal, tax, total, balance } = totals;
  const bankRows = bankingFieldRows(banking);
  const showBanking = hasBankingDetails(banking);
  const showBankBox = bankRows.length > 0 || banking.bankingNote.trim() !== "";

  return (
    <article id="invoice-sheet" className={t.sheet}>
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
          {/*
           * Business name and address are read-only here — they are edited
           * only through the Company Details overlay (the pencil button). The
           * text keeps the same position and typography the old inline inputs
           * had; when nothing is saved yet a muted prompt stands in.
           */}
          <div className="flex items-start gap-3">
            <div className="min-w-0">
              {inv.business.trim() ? (
                <p
                  className={cn(
                    "break-words text-lg font-semibold text-foreground",
                    t.headingFont,
                  )}
                >
                  {inv.business}
                </p>
              ) : (
                <p
                  className={cn(
                    "text-lg font-semibold italic text-muted-foreground/60 print:hidden",
                    t.headingFont,
                  )}
                >
                  Your business name
                </p>
              )}
              {inv.address.trim() ? (
                <p className="mt-2 whitespace-pre-line break-words text-sm text-muted-foreground">
                  {inv.address}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-muted-foreground/60 print:hidden">
                  Add your business address from the edit button →
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onEditProfile}
              aria-label="Edit business details"
              title="Edit business details"
              className="shrink-0 print:hidden"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="w-full sm:w-64">
          <div className={t.invoiceTitleWrap}>
            <span className={t.invoiceTitleText}>INVOICE</span>
          </div>
          <div className="flex items-center justify-center gap-1 sm:justify-end">
            <span className="text-xs font-medium text-muted-foreground">#</span>
            <input
              style={{ fieldSizing: "content" }}
              className={`${cell} w-auto min-w-8 text-right`}
              value={inv.invoiceNo}
              onChange={(e) => patch({ invoiceNo: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className={cn(t.partiesTop, "grid gap-6 sm:grid-cols-2")}>
        <div className="space-y-4">
          <Block label="Bill from" labelClassName={t.label}>
            <textarea
              className={`${cell} min-h-16 resize-none`}
              placeholder="Name, address, email"
              value={inv.from}
              onChange={(e) => patch({ from: e.target.value })}
            />
            <input
              type="tel"
              aria-label="Your phone number"
              className={`${cell} mt-2`}
              placeholder="Phone number"
              value={inv.fromPhone}
              onChange={(e) => patch({ fromPhone: e.target.value })}
            />
          </Block>
          <Block label="Bill to" labelClassName={t.label}>
            <textarea
              className={`${cell} min-h-16 resize-none`}
              placeholder="Who is this invoice to?"
              value={inv.to}
              onChange={(e) => patch({ to: e.target.value })}
            />
            <input
              type="tel"
              aria-label="Client phone number"
              className={`${cell} mt-2`}
              placeholder="Phone number"
              value={inv.toPhone}
              onChange={(e) => patch({ toPhone: e.target.value })}
            />
          </Block>
          <Block label="Ship to" labelClassName={t.label}>
            <textarea
              className={`${cell} min-h-12 resize-none`}
              placeholder="(optional)"
              value={inv.shipTo}
              onChange={(e) => patch({ shipTo: e.target.value })}
            />
          </Block>
        </div>
        <div className="space-y-2 sm:pl-6">
          <Row label="Date" labelClassName={t.label}>
            <input
              type="date"
              className={`${cell} text-right`}
              value={inv.date}
              onChange={(e) => patch({ date: e.target.value })}
            />
          </Row>
          <Row label="Payment terms" labelClassName={t.label}>
            <input
              className={`${cell} text-right`}
              value={inv.terms}
              onChange={(e) => patch({ terms: e.target.value })}
            />
          </Row>
          <Row label="Due date" labelClassName={t.label}>
            <input
              type="date"
              className={`${cell} text-right`}
              value={inv.dueDate}
              onChange={(e) => patch({ dueDate: e.target.value })}
            />
          </Row>
          <Row label="Balance due" labelClassName={t.label}>
            <input
              readOnly
              tabIndex={-1}
              aria-label="Balance due (calculated)"
              className={`${cell} text-right text-sm font-semibold`}
              value={money(balance)}
            />
          </Row>
        </div>
      </div>

      <div className={t.itemsTop}>
        {/*
         * The line-items table. On >=sm it is a 5-column grid with a header
         * row. Below sm the header is hidden and each row becomes a stacked
         * block: the description on its own line, then Qty / Rate / Amount /
         * remove in a 2x2 grid, each with a small caption so the numbers stay
         * labelled without the header. Every wrapper is `sm:contents`, so at
         * >=sm the inner controls flatten straight back into the 5-col grid.
         */}
        <div
          className={cn("hidden grid-cols-[1fr_60px_88px_88px_28px] gap-2 sm:grid", t.tableHead)}
        >
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
          <span />
        </div>
        {inv.items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "space-y-2 sm:grid sm:grid-cols-[1fr_60px_88px_88px_28px] sm:items-center sm:gap-2 sm:space-y-0",
              t.itemRow,
            )}
          >
            <label className="block sm:contents">
              <span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
                Item
              </span>
              <input
                className={cell}
                placeholder="Description of service or item"
                value={item.name}
                onChange={(e) => setItem(item.id, "name", e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-2 sm:contents">
              <label className="sm:contents">
                <span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
                  Qty
                </span>
                <input
                  type="number"
                  min={0}
                  aria-label="Quantity"
                  className={`${cell} text-right`}
                  value={item.qty}
                  onChange={(e) => setItem(item.id, "qty", e.target.value)}
                />
              </label>
              <label className="sm:contents">
                <span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
                  Rate
                </span>
                <input
                  type="number"
                  min={0}
                  aria-label="Rate"
                  className={`${cell} text-right`}
                  value={item.rate}
                  onChange={(e) => setItem(item.id, "rate", e.target.value)}
                />
              </label>
              <div className="sm:contents">
                <span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
                  Amount
                </span>
                <span className="block px-2 py-1.5 text-left text-sm sm:py-0 sm:text-right">
                  {money(item.qty * item.rate)}
                </span>
              </div>
              <div className="flex items-center justify-end sm:contents">
                <button
                  aria-label="Remove line"
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive print:hidden"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" className="mt-3 print:hidden" onClick={addItem}>
          <Plus /> Line item
        </Button>
      </div>

      <div className={cn(t.summaryTop, "grid gap-8 sm:grid-cols-2")}>
        <Block label="Notes" labelClassName={t.label}>
          <textarea
            className={`${cell} min-h-20 resize-none`}
            placeholder="Notes or terms — e.g. bank details, late fees"
            value={inv.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </Block>
        <div className="space-y-2 text-sm">
          <Row label="Subtotal" labelClassName={t.label}>
            <span className="block px-2 py-1.5 text-right">{money(subtotal)}</span>
          </Row>
          <Row label="Tax (%)" labelClassName={t.label}>
            <input
              type="number"
              min={0}
              className={`${cell} text-right`}
              value={inv.taxPercent}
              onChange={(e) => patch({ taxPercent: Number(e.target.value) })}
            />
          </Row>
          <Row label="Discount" labelClassName={t.label}>
            <input
              type="number"
              min={0}
              className={`${cell} text-right`}
              value={inv.discount}
              onChange={(e) => patch({ discount: Number(e.target.value) })}
            />
          </Row>
          <Row label="Total" labelClassName={t.label}>
            <span className="block px-2 py-1.5 text-right font-semibold">
              {money(total)}
            </span>
          </Row>
          <Row label="Amount paid" labelClassName={t.label}>
            <input
              type="number"
              min={0}
              className={`${cell} text-right`}
              value={inv.amountPaid}
              onChange={(e) => patch({ amountPaid: Number(e.target.value) })}
            />
          </Row>
          <div className={t.totalsDivider}>
            <Row label="Balance due" labelClassName={t.label}>
              <span className="block px-2 py-1.5 text-right text-base font-bold">
                {money(balance)}
              </span>
            </Row>
          </div>
        </div>
      </div>

      {signatureUrl && (
        <div className="mt-10 flex justify-end print:mt-14">
          <div className="w-52 max-w-full">
            <img
              src={signatureUrl}
              alt="Authorized signature"
              className="h-16 w-auto max-w-full rounded-sm bg-white object-contain object-left p-1.5"
            />
            <div className="mt-1.5 border-t border-foreground/70 pt-1.5">
              {inv.business.trim() && (
                <p className={cn("text-sm font-semibold text-foreground", t.headingFont)}>
                  {inv.business}
                </p>
              )}
              <p className={cn("mt-0.5", t.label)}>Signature</p>
            </div>
          </div>
        </div>
      )}

      {showBanking && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 print:mt-12">
          {banking.payableTo.trim() && (
            <div className="rounded-sm border border-border p-4">
              <p className={cn("mb-1.5", t.label)}>Payable to</p>
              <p className={cn("text-sm font-semibold text-foreground", t.headingFont)}>
                {banking.payableTo}
              </p>
            </div>
          )}
          {showBankBox && (
            <div className="rounded-sm border border-border p-4">
              <p className={cn("mb-1.5", t.label)}>Banking details</p>
              <dl className="space-y-1 text-sm">
                {bankRows.map((row) => (
                  <div key={row.label} className="flex flex-wrap gap-x-1.5">
                    <dt className="text-muted-foreground">{row.label}:</dt>
                    <dd className="break-words font-medium text-foreground">{row.value}</dd>
                  </div>
                ))}
              </dl>
              {banking.bankingNote.trim() && (
                <p className="mt-2 text-xs text-muted-foreground">{banking.bankingNote}</p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Row({
  label,
  labelClassName,
  children,
}: {
  label: string;
  labelClassName: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
      <span className={labelClassName}>{label}</span>
      <div className="w-32">{children}</div>
    </div>
  );
}

function Block({
  label,
  labelClassName,
  children,
}: {
  label: string;
  labelClassName: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className={cn("mb-1", labelClassName)}>{label}</p>
      {children}
    </div>
  );
}
