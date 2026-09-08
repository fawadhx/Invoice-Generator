import { type ReactNode } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bankingFieldRows, hasBankingDetails } from "@/lib/company-profile";
import type { InvoiceTemplateProps, UiTheme } from "../types";

// Shared affordance class defined in styles.css (@layer components).
// Extra utilities (text-right, min-h-*, resize-none, font weight) are
// appended per field where needed.
const cell = "editable-field";

// Plain read-only text in preview mode — keeps the same horizontal padding as
// an `editable-field` so columns still line up with the editable view.
const previewText = "block whitespace-pre-line break-words px-2 py-1.5 text-sm text-foreground";

type Props = InvoiceTemplateProps & { theme: UiTheme };

/**
 * The one editable invoice document, shared by every template. The markup —
 * and therefore the set of editable fields and the `editable-field`
 * affordance on each — is identical across templates; the `theme` prop is
 * the only thing that varies the look. Add a field here once and every
 * template gets it.
 *
 * `preview` flips the whole surface into a read-only representation that
 * matches the exported PDF: no input chrome, no editing-only controls, and
 * blank fields omitted rather than shown as placeholders. It is purely a
 * view-state toggle — the invoice data is untouched — so switching back to
 * editing loses nothing.
 */
export function InvoiceDocument({
  inv,
  totals,
  patch,
  setItem,
  addItem,
  removeItem,
  onEditProfile,
  formatMoney: money,
  formatDate: fmtDate,
  logoUrl,
  signatureUrl,
  banking,
  preview,
  theme: t,
}: Props) {
  const { subtotal, tax, discount, total, amountPaid, balance } = totals;
  const bankRows = bankingFieldRows(banking);
  const showBanking = hasBankingDetails(banking);
  const showBankBox = bankRows.length > 0 || banking.bankingNote.trim() !== "";
  const taxPct = Number.isFinite(inv.taxPercent) ? inv.taxPercent : 0;

  // In preview mode a blank starter line (no description, nothing billed) is
  // dropped entirely — matching the PDF, which never prints an empty row.
  const items =
    preview
      ? inv.items.filter((i) => i.name.trim() !== "" || i.qty * i.rate !== 0)
      : inv.items;

  return (
    <article id="invoice-sheet" className={t.sheet}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {/*
           * Logo — display only. It comes from the saved Company Profile;
           * uploading / changing it lives in the "Edit business details"
           * overlay. When none is saved a muted placeholder stands in (the
           * same way the business-name / address prompts do), and it is
           * hidden entirely in preview and print.
           */}
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Business logo"
              className="mb-4 h-20 w-auto max-w-[220px] object-contain object-left"
            />
          ) : preview ? null : (
            <div className="mb-4 flex h-20 w-40 items-center justify-center rounded-sm border border-dashed border-border px-3 text-center text-[11px] italic leading-tight text-muted-foreground/60 print:hidden">
              Add a logo from “Edit business details”
            </div>
          )}
          {/*
           * Business name and address are read-only here — they are edited
           * only through the Company Details overlay (the pencil button). The
           * text keeps the same position and typography the old inline inputs
           * had; when nothing is saved yet a muted prompt stands in (except in
           * preview, where a blank field simply renders nothing).
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
              ) : preview ? null : (
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
              ) : preview ? null : (
                <p className="mt-2 text-sm italic text-muted-foreground/60 print:hidden">
                  Add your business address from the edit button →
                </p>
              )}
            </div>
            {!preview && (
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
            )}
          </div>
        </div>
        <div className="w-full sm:w-64">
          <div className={t.invoiceTitleWrap}>
            <span className={t.invoiceTitleText}>INVOICE</span>
          </div>
          {(!preview || inv.invoiceNo.trim()) && (
            <div className="flex items-center justify-center gap-1 sm:justify-end">
              <span className="text-xs font-medium text-muted-foreground">#</span>
              {preview ? (
                <span className="text-right text-sm text-foreground">{inv.invoiceNo}</span>
              ) : (
                <input
                  style={{ fieldSizing: "content" }}
                  className={`${cell} w-auto min-w-8 text-right`}
                  value={inv.invoiceNo}
                  onChange={(e) => patch({ invoiceNo: e.target.value })}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className={cn(t.partiesTop, "grid gap-6 sm:grid-cols-2")}>
        <div className="space-y-4">
          {(!preview || inv.from.trim() || inv.fromPhone.trim()) && (
            <Block label="Bill from" labelClassName={t.label}>
              <AreaField
                preview={preview}
                className="min-h-16"
                placeholder="Name, address, email"
                value={inv.from}
                onChange={(v) => patch({ from: v })}
              />
              {(!preview || inv.fromPhone.trim()) && (
                <Field
                  preview={preview}
                  type="tel"
                  ariaLabel="Your phone number"
                  className="mt-2"
                  placeholder="Phone number"
                  value={inv.fromPhone}
                  onChange={(v) => patch({ fromPhone: v })}
                />
              )}
            </Block>
          )}
          {(!preview || inv.to.trim() || inv.toPhone.trim()) && (
            <Block label="Bill to" labelClassName={t.label}>
              <AreaField
                preview={preview}
                className="min-h-16"
                placeholder="Who is this invoice to?"
                value={inv.to}
                onChange={(v) => patch({ to: v })}
              />
              {(!preview || inv.toPhone.trim()) && (
                <Field
                  preview={preview}
                  type="tel"
                  ariaLabel="Client phone number"
                  className="mt-2"
                  placeholder="Phone number"
                  value={inv.toPhone}
                  onChange={(v) => patch({ toPhone: v })}
                />
              )}
            </Block>
          )}
          {(!preview || inv.shipTo.trim()) && (
            <Block label="Ship to" labelClassName={t.label}>
              <AreaField
                preview={preview}
                className="min-h-12"
                placeholder="(optional)"
                value={inv.shipTo}
                onChange={(v) => patch({ shipTo: v })}
              />
            </Block>
          )}
        </div>
        <div className="space-y-2 sm:pl-6">
          {(!preview || inv.date) && (
            <Row label="Date" labelClassName={t.label}>
              <Field
                preview={preview}
                type="date"
                className="text-right"
                previewClassName="text-right"
                value={inv.date}
                displayValue={fmtDate(inv.date)}
                onChange={(v) => patch({ date: v })}
              />
            </Row>
          )}
          {(!preview || inv.terms.trim()) && (
            <Row label="Payment terms" labelClassName={t.label}>
              <Field
                preview={preview}
                className="text-right"
                previewClassName="text-right"
                value={inv.terms}
                onChange={(v) => patch({ terms: v })}
              />
            </Row>
          )}
          {(!preview || inv.dueDate) && (
            <Row label="Due date" labelClassName={t.label}>
              <Field
                preview={preview}
                type="date"
                className="text-right"
                previewClassName="text-right"
                value={inv.dueDate}
                displayValue={fmtDate(inv.dueDate)}
                onChange={(v) => patch({ dueDate: v })}
              />
            </Row>
          )}
          <Row label="Balance due" labelClassName={t.label}>
            {preview ? (
              <span className="block px-2 py-1.5 text-right text-sm font-semibold text-foreground">
                {money(balance)}
              </span>
            ) : (
              <input
                readOnly
                tabIndex={-1}
                aria-label="Balance due (calculated)"
                className={`${cell} text-right text-sm font-semibold`}
                value={money(balance)}
              />
            )}
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
         * In preview the inputs become plain text and the remove control and
         * "Line item" button are gone.
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
        {items.map((item) => (
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
              {preview ? (
                <span className="block px-2 py-1.5 text-sm text-foreground sm:py-0">
                  {item.name}
                </span>
              ) : (
                <input
                  className={cell}
                  placeholder="Description of service or item"
                  value={item.name}
                  onChange={(e) => setItem(item.id, "name", e.target.value)}
                />
              )}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:contents">
              <label className="sm:contents">
                <span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
                  Qty
                </span>
                {preview ? (
                  <span className="block px-2 py-1.5 text-left text-sm text-foreground sm:py-0 sm:text-right">
                    {item.qty}
                  </span>
                ) : (
                  <input
                    type="number"
                    min={0}
                    aria-label="Quantity"
                    className={`${cell} text-right`}
                    value={item.qty}
                    onChange={(e) => setItem(item.id, "qty", e.target.value)}
                  />
                )}
              </label>
              <label className="sm:contents">
                <span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
                  Rate
                </span>
                {preview ? (
                  <span className="block px-2 py-1.5 text-left text-sm text-foreground sm:py-0 sm:text-right">
                    {money(item.rate)}
                  </span>
                ) : (
                  <input
                    type="number"
                    min={0}
                    aria-label="Rate"
                    className={`${cell} text-right`}
                    value={item.rate}
                    onChange={(e) => setItem(item.id, "rate", e.target.value)}
                  />
                )}
              </label>
              <div className="sm:contents">
                <span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
                  Amount
                </span>
                <span className="block px-2 py-1.5 text-left text-sm sm:py-0 sm:text-right">
                  {money(item.qty * item.rate)}
                </span>
              </div>
              {!preview && (
                <div className="flex items-center justify-end sm:contents">
                  <button
                    aria-label="Remove line"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive print:hidden"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {!preview && (
          <Button variant="outline" size="sm" className="mt-3 print:hidden" onClick={addItem}>
            <Plus /> Line item
          </Button>
        )}
      </div>

      <div className={cn(t.summaryTop, "grid gap-8 sm:grid-cols-2")}>
        {!preview || inv.notes.trim() ? (
          <Block label="Notes" labelClassName={t.label}>
            <AreaField
              preview={preview}
              className="min-h-20"
              placeholder="Notes or terms — e.g. bank details, late fees"
              value={inv.notes}
              onChange={(v) => patch({ notes: v })}
            />
          </Block>
        ) : (
          <div aria-hidden />
        )}
        <div className="space-y-2 text-sm">
          <Row label="Subtotal" labelClassName={t.label}>
            <span className="block px-2 py-1.5 text-right">{money(subtotal)}</span>
          </Row>
          <Row label={preview ? `Tax (${taxPct}%)` : "Tax (%)"} labelClassName={t.label}>
            {preview ? (
              <span className="block px-2 py-1.5 text-right">{money(tax)}</span>
            ) : (
              <input
                type="number"
                min={0}
                className={`${cell} text-right`}
                value={inv.taxPercent}
                onChange={(e) => patch({ taxPercent: Number(e.target.value) })}
              />
            )}
          </Row>
          <Row label="Discount" labelClassName={t.label}>
            {preview ? (
              <span className="block px-2 py-1.5 text-right">- {money(discount)}</span>
            ) : (
              <input
                type="number"
                min={0}
                className={`${cell} text-right`}
                value={inv.discount}
                onChange={(e) => patch({ discount: Number(e.target.value) })}
              />
            )}
          </Row>
          <Row label="Total" labelClassName={t.label}>
            <span className="block px-2 py-1.5 text-right font-semibold">{money(total)}</span>
          </Row>
          <Row label="Amount paid" labelClassName={t.label}>
            {preview ? (
              <span className="block px-2 py-1.5 text-right">- {money(amountPaid)}</span>
            ) : (
              <input
                type="number"
                min={0}
                className={`${cell} text-right`}
                value={inv.amountPaid}
                onChange={(e) => patch({ amountPaid: Number(e.target.value) })}
              />
            )}
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

/**
 * A single-line editable field that collapses to plain text in preview mode.
 * Returns `null` in preview when there is nothing to show, so callers gate the
 * surrounding label/row on the same emptiness check.
 */
function Field({
  preview,
  value,
  onChange,
  className,
  previewClassName,
  type = "text",
  placeholder,
  ariaLabel,
  displayValue,
}: {
  preview: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  previewClassName?: string;
  type?: string;
  placeholder?: string;
  ariaLabel?: string;
  /** Text to show in preview instead of the raw value (e.g. a formatted date). */
  displayValue?: string;
}) {
  if (preview) {
    const shown = (displayValue ?? value ?? "").trim();
    if (!shown) return null;
    return <span className={cn(previewText, previewClassName)}>{shown}</span>;
  }
  return (
    <input
      type={type}
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={cn(cell, className)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Multi-line variant of {@link Field}. */
function AreaField({
  preview,
  value,
  onChange,
  className,
  placeholder,
}: {
  preview: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  if (preview) {
    const v = value.trim();
    if (!v) return null;
    return <p className={previewText}>{v}</p>;
  }
  return (
    <textarea
      className={cn(cell, "resize-none", className)}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
