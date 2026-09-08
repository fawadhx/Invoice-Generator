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
  businessName,
  businessAddress,
  businessPhone,
  businessEmail,
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

  // The editing view stacks fields on narrow screens (the `sm:` breakpoints
  // below) purely for touch-friendly data entry. The Preview modal, by
  // contrast, must reproduce the exported PDF exactly at *any* viewport width
  // — it renders inside a fixed-width, horizontally-scrollable surface — so in
  // preview those breakpoints are forced on regardless of screen size.
  //
  // `fx(cls)` emits its classes only in preview; paired with `cn()`'s
  // tailwind-merge it overrides the conflicting stacked base utilities.
  // `themed(cls)` does the same for the per-template theme strings, which bake
  // a couple of `sm:` utilities in directly (sheet padding, INVOICE
  // alignment). When `preview` is false both are no-ops — the editing view is
  // byte-for-byte unchanged.
  const fx = (cls: string) => (preview ? cls : "");
  const themed = (cls: string) => (preview ? cls.replace(/\bsm:/g, "") : cls);

  // In preview mode a blank starter line (no description, nothing billed) is
  // dropped entirely — matching the PDF, which never prints an empty row.
  const items = preview
    ? inv.items.filter((i) => i.name.trim() !== "" || i.qty * i.rate !== 0)
    : inv.items;

  return (
    // The stable `invoice-sheet` id (print target + the homepage jump link)
    // belongs to the one editable document. The preview copy renders inside a
    // modal alongside it, so it must not duplicate the id.
    <article id={preview ? undefined : "invoice-sheet"} className={cn(themed(t.sheet))}>
      {/*
       * Header — a traditional invoice masthead. Top-left: the sender's
       * identity (logo, name, address, phone, email), all read-only and read
       * straight from the saved Company Profile; editing lives in the
       * "Edit business details" overlay. Top-right: the "INVOICE" heading and
       * this invoice's own meta (number, date, due date). A full-width rule
       * separates the masthead from the body. On mobile the two blocks stack,
       * left then right.
       */}
      <header
        className={cn(
          "flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8",
          fx("flex-row items-start justify-between gap-8"),
        )}
      >
        <div className="min-w-0 flex-1">
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

          <div className="min-w-0 space-y-1">
            {businessName.trim() ? (
              <p className={cn("break-words text-lg font-semibold text-foreground", t.headingFont)}>
                {businessName}
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
            {businessAddress.trim() ? (
              <p className="whitespace-pre-line break-words text-sm text-muted-foreground">
                {businessAddress}
              </p>
            ) : preview ? null : (
              <p className="text-sm italic text-muted-foreground/60 print:hidden">
                Add your business address from “Edit business details”
              </p>
            )}
            {businessPhone.trim() && (
              <p className="break-words text-sm text-muted-foreground">{businessPhone}</p>
            )}
            {businessEmail.trim() && (
              <p className="break-all text-sm text-muted-foreground">{businessEmail}</p>
            )}
          </div>

          {!preview && (
            <Button
              type="button"
              variant="outline"
              onClick={onEditProfile}
              title="Edit business details"
              className="mt-3 border-primary/50 bg-primary/5 font-semibold text-foreground hover:bg-primary/10 hover:text-foreground print:hidden"
            >
              <Pencil className="h-4 w-4" />
              Edit business details
            </Button>
          )}
        </div>

        <div className={cn("w-full shrink-0 sm:w-64", fx("w-64"))}>
          <div className={cn(themed(t.invoiceTitleWrap))}>
            <span className={t.invoiceTitleText}>INVOICE</span>
          </div>
          <div className="mt-3 space-y-1.5">
            {(!preview || inv.invoiceNo.trim()) && (
              <HeaderMeta label="Invoice #" labelClassName={t.label}>
                {preview ? (
                  <span className={cn(previewText, "text-right")}>{inv.invoiceNo}</span>
                ) : (
                  <input
                    aria-label="Invoice number"
                    className={`${cell} w-full text-right`}
                    value={inv.invoiceNo}
                    // Typing here means the user has taken over the number for
                    // this invoice — stop auto-numbering from re-issuing it.
                    onChange={(e) =>
                      patch({ invoiceNo: e.target.value, invoiceNoAutoGenerated: false })
                    }
                  />
                )}
              </HeaderMeta>
            )}
            {(!preview || inv.date) && (
              <HeaderMeta label="Date" labelClassName={t.label}>
                <Field
                  preview={preview}
                  type="date"
                  className="w-full text-right"
                  previewClassName="text-right"
                  value={inv.date}
                  displayValue={fmtDate(inv.date)}
                  onChange={(v) => patch({ date: v })}
                />
              </HeaderMeta>
            )}
            {(!preview || inv.dueDate) && (
              <HeaderMeta label="Due date" labelClassName={t.label}>
                <Field
                  preview={preview}
                  type="date"
                  className="w-full text-right"
                  previewClassName="text-right"
                  value={inv.dueDate}
                  displayValue={fmtDate(inv.dueDate)}
                  onChange={(v) => patch({ dueDate: v })}
                />
              </HeaderMeta>
            )}
          </div>
        </div>
      </header>

      <hr className="mt-6 border-border" />

      <div className={cn(t.partiesTop, "grid gap-6 sm:grid-cols-2", fx("grid-cols-2"))}>
        <div className="space-y-4">
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
        <div className={cn("space-y-2 sm:pl-6", fx("pl-6"))}>
          {/* Date / due date now live in the header masthead. */}
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
          className={cn(
            "hidden grid-cols-[1fr_60px_88px_88px_28px] gap-2 sm:grid",
            t.tableHead,
            fx("grid"),
          )}
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
              fx("grid grid-cols-[1fr_60px_88px_88px_28px] items-center gap-2 space-y-0"),
            )}
          >
            <label className={cn("block sm:contents", fx("contents"))}>
              <span
                className={cn(
                  "mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden",
                  fx("hidden"),
                )}
              >
                Item
              </span>
              {preview ? (
                <span className="block px-2 py-0 text-sm text-foreground">{item.name}</span>
              ) : (
                <input
                  className={cell}
                  placeholder="Description of service or item"
                  value={item.name}
                  onChange={(e) => setItem(item.id, "name", e.target.value)}
                />
              )}
            </label>
            <div className={cn("grid grid-cols-2 gap-2 sm:contents", fx("contents"))}>
              <label className={cn("sm:contents", fx("contents"))}>
                <span
                  className={cn(
                    "mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden",
                    fx("hidden"),
                  )}
                >
                  Qty
                </span>
                {preview ? (
                  <span className="block px-2 py-0 text-right text-sm text-foreground">
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
              <label className={cn("sm:contents", fx("contents"))}>
                <span
                  className={cn(
                    "mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden",
                    fx("hidden"),
                  )}
                >
                  Rate
                </span>
                {preview ? (
                  <span className="block px-2 py-0 text-right text-sm text-foreground">
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
              <div className={cn("sm:contents", fx("contents"))}>
                <span
                  className={cn(
                    "mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden",
                    fx("hidden"),
                  )}
                >
                  Amount
                </span>
                <span
                  className={cn(
                    "block px-2 py-1.5 text-left text-sm sm:py-0 sm:text-right",
                    fx("py-0 text-right"),
                  )}
                >
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

      <div className={cn(t.summaryTop, "grid gap-8 sm:grid-cols-2", fx("grid-cols-2"))}>
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
              {businessName.trim() && (
                <p className={cn("text-sm font-semibold text-foreground", t.headingFont)}>
                  {businessName}
                </p>
              )}
              <p className={cn("mt-0.5", t.label)}>Signature</p>
            </div>
          </div>
        </div>
      )}

      {showBanking && (
        <div className={cn("mt-10 grid gap-4 sm:grid-cols-2 print:mt-12", fx("grid-cols-2"))}>
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
 * A label + value line in the header masthead's top-right meta stack (invoice
 * number, date, due date). Label sits left, value right — the value column
 * takes the remaining width so a native `<input type="date">` still fits.
 */
function HeaderMeta({
  label,
  labelClassName,
  children,
}: {
  label: string;
  labelClassName: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-2">
      <span className={cn("whitespace-nowrap", labelClassName)}>{label}</span>
      <div className="min-w-0 text-right">{children}</div>
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
