import type { Invoice } from "./invoice";
import {
  DEFAULT_FORMAT_PREFS,
  type DateFormatId,
  type FormatPrefs,
  type NumberFormatId,
} from "./locale-format";

/**
 * A persisted, one-time business identity that auto-fills into every invoice.
 *
 * This is deliberately *separate* from the per-invoice `Invoice` state: it
 * lives under its own localStorage key, it is never touched by "Clear
 * invoice", and editing the invoice document inline never writes back to it.
 * The only way to change it is the Company Details overlay
 * (`company-profile-dialog.tsx`).
 */
export type CompanyProfile = {
  /** Logo as a data URL — same format the invoice logo upload produces. */
  logo: string;
  /**
   * Signature as a data URL, regardless of how it was captured. `""` when
   * none has been set.
   */
  signatureUrl: string;
  /** How `signatureUrl` was produced. `null` when there is no signature. */
  signatureType: "upload" | "drawn" | null;
  businessName: string;
  /** Multi-line business address. */
  address: string;
  email: string;
  phone: string;

  // ---- Currency & format (Phase B) ----
  // Fixed at the profile level and applied to every invoice in this browser —
  // there is no per-invoice override. See `src/lib/locale-format.ts`.
  /** ISO 3166-1 alpha-2 country code, or `""` if never set. Drives the
   *  auto-suggested defaults below; the user can override each one after. */
  country: string;
  /** ISO 4217 currency code (e.g. `"PKR"`). Informational — display comes
   *  from `currencyDisplay`. */
  currencyCode: string;
  /** Literal string shown before every money amount (`"Rs."`, `"$"`, `"₨"`,
   *  or anything the user types). */
  currencyDisplay: string;
  dateFormat: DateFormatId;
  numberFormat: NumberFormatId;

  // ---- Invoice numbering (Phase C) ----
  // A prefix + running counter so each *new* invoice is numbered automatically
  // instead of the user retyping it. Only the prefix being non-empty turns the
  // scheme on (see `hasInvoiceNumbering`); otherwise the invoice number stays a
  // plain manual field. The counter only advances when a new number is handed
  // out (fresh invoice / "Clear invoice") — editing the number on an invoice
  // never writes back here.
  /** String placed before the number, e.g. `"INV-"`. `""` = numbering off. */
  invoicePrefix: string;
  /** The next integer to assign. Starts at 1. */
  nextInvoiceNumber: number;
  /** Zero-pad the number to this width (`3` → `001`). `0` = no padding. */
  numberPadding: number;

  // ---- Payable To & banking details (Phase E) ----
  // An optional footer printed at the very bottom of every invoice (after the
  // signature block and Notes). It always shows once filled in — there is no
  // per-invoice toggle. Leaving every field blank renders nothing at all, so
  // the invoice looks exactly as it did before this feature. See
  // `hasBankingDetails` / `bankingFieldRows` for the render gate + field order.
  /** Who a payment should be made out to (may differ from the account title). */
  payableTo: string;
  bankName: string;
  /** Account holder name as it appears at the bank. */
  accountTitle: string;
  accountNumber: string;
  iban: string;
  /** Freeform line under the banking box, e.g. "Share receipt after payment". */
  bankingNote: string;
};

/** Just the Payable To / banking fields, pulled off a full profile. */
export type BankingDetails = Pick<
  CompanyProfile,
  "payableTo" | "bankName" | "accountTitle" | "accountNumber" | "iban" | "bankingNote"
>;

export const COMPANY_PROFILE_KEY = "rapidai-company-profile";

export const emptyCompanyProfile: CompanyProfile = {
  logo: "",
  signatureUrl: "",
  signatureType: null,
  businessName: "",
  address: "",
  email: "",
  phone: "",
  country: "",
  currencyCode: "USD",
  currencyDisplay: DEFAULT_FORMAT_PREFS.currencyDisplay,
  dateFormat: DEFAULT_FORMAT_PREFS.dateFormat,
  numberFormat: DEFAULT_FORMAT_PREFS.numberFormat,
  invoicePrefix: "",
  nextInvoiceNumber: 1,
  numberPadding: 0,
  payableTo: "",
  bankName: "",
  accountTitle: "",
  accountNumber: "",
  iban: "",
  bankingNote: "",
};

/**
 * The profile a brand-new user starts from: `emptyCompanyProfile` plus
 * out-of-the-box invoice-numbering defaults (`INV-` prefix, zero-padded to 5 →
 * `INV-00001`) so numbering is useful before the user configures anything.
 * Every field stays fully editable — clearing the prefix returns to manual
 * numbering, exactly as an empty prefix does today.
 *
 * This is deliberately NOT the merge base used by `loadCompanyProfile`: a
 * previously saved profile (including one from before numbering existed) keeps
 * its own values and is never retro-fitted with these defaults. It only takes
 * effect when there is no saved profile at all.
 */
export const defaultCompanyProfile: CompanyProfile = {
  ...emptyCompanyProfile,
  invoicePrefix: "INV-",
  numberPadding: 5,
};

/** Pulls just the formatting preferences out of a profile. */
export function formatPrefsOf(p: CompanyProfile): FormatPrefs {
  return {
    currencyDisplay: p.currencyDisplay || DEFAULT_FORMAT_PREFS.currencyDisplay,
    dateFormat: p.dateFormat || DEFAULT_FORMAT_PREFS.dateFormat,
    numberFormat: p.numberFormat || DEFAULT_FORMAT_PREFS.numberFormat,
  };
}

/** True when auto-numbering is switched on (a prefix has been set). */
export function hasInvoiceNumbering(p: CompanyProfile): boolean {
  return p.invoicePrefix.trim() !== "";
}

/** Pulls just the Payable To / banking fields out of a profile. */
export function bankingDetailsOf(p: CompanyProfile): BankingDetails {
  return {
    payableTo: p.payableTo,
    bankName: p.bankName,
    accountTitle: p.accountTitle,
    accountNumber: p.accountNumber,
    iban: p.iban,
    bankingNote: p.bankingNote,
  };
}

/**
 * The "Banking details" box rows, in display order, with blank fields dropped.
 * Shared by the on-screen document and the PDF so both show the same labels in
 * the same order. `payableTo` and `bankingNote` are rendered separately.
 */
export function bankingFieldRows(b: BankingDetails): Array<{ label: string; value: string }> {
  return [
    { label: "Bank name", value: b.bankName },
    { label: "Account title", value: b.accountTitle },
    { label: "Account number", value: b.accountNumber },
    { label: "IBAN", value: b.iban },
  ]
    .map((r) => ({ label: r.label, value: r.value.trim() }))
    .filter((r) => r.value !== "");
}

/**
 * True when at least one Payable To / banking field is filled in. When this is
 * false the footer section renders nothing and the invoice is unchanged.
 */
export function hasBankingDetails(b: BankingDetails): boolean {
  return Boolean(b.payableTo.trim() || b.bankingNote.trim() || bankingFieldRows(b).length > 0);
}

/** Coerces a stored value into a safe positive integer, `fallback` otherwise. */
function toInt(value: unknown, fallback: number, min = 0): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= min ? n : fallback;
}

/**
 * Renders invoice number `n` under a profile's prefix + padding rules, e.g.
 * `{ invoicePrefix: "INV-", numberPadding: 3 }` and `7` → `"INV-007"`.
 */
export function formatInvoiceNumber(p: CompanyProfile, n: number): string {
  const digits = String(Math.max(1, Math.floor(n) || 1));
  const padded = p.numberPadding > 0 ? digits.padStart(p.numberPadding, "0") : digits;
  return `${p.invoicePrefix}${padded}`;
}

/**
 * The number the *current* auto-generated invoice should display under `p`'s
 * scheme — i.e. `p.nextInvoiceNumber` rendered with the prefix + padding.
 *
 * The counter is deliberately NOT advanced here: an invoice "holds" this slot
 * until it is finalised (downloaded) or replaced ("Clear invoice"), at which
 * point {@link advanceInvoiceCounter} moves the counter on exactly once. This
 * keeps the on-screen number in step with the dialog's "Next invoice number"
 * preview, which shows the same value.
 */
export function currentInvoiceNumber(p: CompanyProfile): string {
  return formatInvoiceNumber(p, Math.max(1, Math.floor(p.nextInvoiceNumber) || 1));
}

/**
 * `p` with its running counter advanced by one. The caller persists the result.
 * Call this once per issued invoice — when the invoice is downloaded, or when
 * "Clear invoice" discards an auto-numbered invoice whose slot a download has
 * not already consumed.
 */
export function advanceInvoiceCounter(p: CompanyProfile): CompanyProfile {
  const n = Math.max(1, Math.floor(p.nextInvoiceNumber) || 1);
  return { ...p, nextInvoiceNumber: n + 1 };
}

/** True when any invoice-numbering setting differs between the two profiles. */
export function invoiceNumberingChanged(a: CompanyProfile, b: CompanyProfile): boolean {
  return (
    a.invoicePrefix !== b.invoicePrefix ||
    a.nextInvoiceNumber !== b.nextInvoiceNumber ||
    a.numberPadding !== b.numberPadding
  );
}

/**
 * Best-effort check that `invoiceNo` is a value `p`'s numbering scheme would
 * produce. Used once, to migrate invoices persisted before the
 * `invoiceNoAutoGenerated` flag existed: a number that still matches the scheme
 * (within a small window around the current counter) is treated as auto, any
 * other value as one the user typed themselves.
 */
export function isSchemeGeneratedNumber(invoiceNo: string, p: CompanyProfile): boolean {
  const s = (invoiceNo ?? "").trim();
  if (s === "" || s === "1") return true; // the app's default before any scheme
  if (!hasInvoiceNumbering(p)) return false;
  const base = Math.max(1, Math.floor(p.nextInvoiceNumber) || 1);
  for (let n = Math.max(1, base - 3); n <= base + 1; n++) {
    if (s === formatInvoiceNumber(p, n)) return true;
  }
  return false;
}

/** True when the profile carries at least one meaningful value. */
export function hasCompanyProfile(p: CompanyProfile): boolean {
  return Boolean(
    p.logo ||
    p.signatureUrl ||
    p.businessName.trim() ||
    p.address.trim() ||
    p.email.trim() ||
    p.phone.trim(),
  );
}

/** Reads the saved profile from localStorage, or `null` if none/corrupt. */
export function loadCompanyProfile(): CompanyProfile | null {
  if (typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem(COMPANY_PROFILE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Partial<CompanyProfile>;
    const merged = { ...emptyCompanyProfile, ...parsed };
    // Numeric fields may arrive as strings / NaN from older or hand-edited data.
    merged.nextInvoiceNumber = toInt(merged.nextInvoiceNumber, 1, 1);
    merged.numberPadding = toInt(merged.numberPadding, 0, 0);
    return merged;
  } catch {
    return null;
  }
}

/** Persists the profile to localStorage. */
export function saveCompanyProfile(p: CompanyProfile): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(p));
}

/**
 * Fills a *blank* invoice from the profile. A field is only written when the
 * invoice's own value is still empty, so anything the user has already typed
 * into the current invoice is preserved. Editing the invoice inline never
 * flows back the other way (see `CompanyProfile` docs).
 */
export function applyCompanyProfile(inv: Invoice, p: CompanyProfile): Invoice {
  const next = { ...inv };
  // Currency is profile-owned (no per-invoice picker), so it is always synced.
  if (p.currencyCode) next.currency = p.currencyCode;
  // The business identity block (logo, name, address, phone, email) and the
  // signature are no longer copied onto the invoice — the document and the PDF
  // read them straight from the profile. `business` / `address` are still
  // filled here purely as a fallback for older stored invoices.
  if (!next.business.trim() && p.businessName.trim()) next.business = p.businessName;
  if (!next.address.trim() && p.address.trim()) next.address = p.address;
  return next;
}
