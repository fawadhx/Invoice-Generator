/**
 * Locale / formatting preferences for the invoice document.
 *
 * These live on the persisted Company Profile (see `company-profile.ts`) and
 * are *fixed* at the profile level — there is deliberately no per-invoice
 * override. Every invoice generated in this browser is formatted with
 * whatever is currently saved.
 *
 * The formatting here is done by hand rather than via `Intl.NumberFormat`
 * for two reasons: the on-screen preview and the PDF must agree exactly, and
 * jsPDF's standard fonts only cover WinAnsi — `Intl` likes to inject narrow
 * no-break spaces and exotic symbols that render as blank boxes in the PDF.
 */

export type DateFormatId = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

export type NumberFormatId = "comma-dot" | "dot-comma" | "space-comma" | "space-dot";

/** The subset of the Company Profile that controls invoice formatting. */
export type FormatPrefs = {
  /** Literal string placed before every money amount (e.g. `"Rs."`, `"$"`). */
  currencyDisplay: string;
  dateFormat: DateFormatId;
  numberFormat: NumberFormatId;
};

/**
 * Formatting used before any Company Profile has been saved — matches what
 * the app shipped with (US-style `$1,234.56`) so nothing changes for a
 * first-time user mid-invoice.
 */
export const DEFAULT_FORMAT_PREFS: FormatPrefs = {
  currencyDisplay: "$",
  dateFormat: "MM/DD/YYYY",
  numberFormat: "comma-dot",
};

const SEPARATORS: Record<NumberFormatId, { group: string; decimal: string }> = {
  "comma-dot": { group: ",", decimal: "." },
  "dot-comma": { group: ".", decimal: "," },
  "space-comma": { group: " ", decimal: "," },
  "space-dot": { group: " ", decimal: "." },
};

/** Options for the "Number format" dropdown, with a live sample of each. */
export const NUMBER_FORMAT_OPTIONS: { id: NumberFormatId; sample: string }[] = [
  { id: "comma-dot", sample: "1,234.56" },
  { id: "dot-comma", sample: "1.234,56" },
  { id: "space-comma", sample: "1 234,56" },
  { id: "space-dot", sample: "1 234.56" },
];

/** Options for the "Date format" dropdown. */
export const DATE_FORMAT_OPTIONS: DateFormatId[] = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

const numOr0 = (v: number) => (Number.isFinite(v) ? v : 0);

/** Formats a bare number (always 2 decimals) with the chosen separators. */
export function formatNumber(value: number, id: NumberFormatId): string {
  const { group, decimal } = SEPARATORS[id] ?? SEPARATORS["comma-dot"];
  const n = numOr0(value);
  const neg = n < 0;
  const fixed = Math.abs(n).toFixed(2);
  const dot = fixed.indexOf(".");
  const intPart = fixed.slice(0, dot);
  const decPart = fixed.slice(dot + 1);
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `${neg ? "-" : ""}${grouped}${decimal}${decPart}`;
}

/**
 * Formats a money amount as `<currencyDisplay><maybe space><number>`.
 * A space is inserted only when the display string ends in a letter or `.`
 * (so `"Rs."` → `Rs. 1,234.56` but `"$"` → `$1,234.56`). A negative sign
 * always leads (`-$5.00`).
 */
export function formatMoney(value: number, prefs: FormatPrefs): string {
  const n = numOr0(value);
  const display = (prefs.currencyDisplay ?? "").trim();
  if (!display) return formatNumber(n, prefs.numberFormat);
  const neg = n < 0;
  const sep = /[A-Za-z.]$/.test(display) ? " " : "";
  return `${neg ? "-" : ""}${display}${sep}${formatNumber(Math.abs(n), prefs.numberFormat)}`;
}

/**
 * Reformats an ISO date string (`YYYY-MM-DD`, the value an `<input
 * type="date">` produces) into the chosen display format. Anything that
 * isn't a plain ISO date is returned untouched.
 */
export function formatDate(iso: string, id: DateFormatId): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return iso ?? "";
  const [, y, mo, d] = m;
  if (id === "DD/MM/YYYY") return `${d}/${mo}/${y}`;
  if (id === "MM/DD/YYYY") return `${mo}/${d}/${y}`;
  return `${y}-${mo}-${d}`;
}

/**
 * A country and the formatting conventions to suggest when it is picked.
 * Every field stays fully editable afterwards — this is a starting point,
 * not a lock.
 */
export type CountryConvention = {
  name: string;
  /** ISO 3166-1 alpha-2. */
  code: string;
  currencyCode: string;
  dateFormat: DateFormatId;
  numberFormat: NumberFormatId;
};

// Curated (not exhaustive) — every major economy plus one entry per widely
// used currency. Conventions are the common commercial-invoice practice for
// the country, mapped onto our small fixed list of formats.
const RAW_COUNTRIES: CountryConvention[] = [
  { name: "United States", code: "US", currencyCode: "USD", dateFormat: "MM/DD/YYYY", numberFormat: "comma-dot" },
  { name: "United Kingdom", code: "GB", currencyCode: "GBP", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Canada", code: "CA", currencyCode: "CAD", dateFormat: "YYYY-MM-DD", numberFormat: "comma-dot" },
  { name: "Australia", code: "AU", currencyCode: "AUD", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "New Zealand", code: "NZ", currencyCode: "NZD", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Ireland", code: "IE", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "India", code: "IN", currencyCode: "INR", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Pakistan", code: "PK", currencyCode: "PKR", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Bangladesh", code: "BD", currencyCode: "BDT", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Sri Lanka", code: "LK", currencyCode: "LKR", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Nepal", code: "NP", currencyCode: "NPR", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Singapore", code: "SG", currencyCode: "SGD", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Malaysia", code: "MY", currencyCode: "MYR", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Hong Kong", code: "HK", currencyCode: "HKD", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Philippines", code: "PH", currencyCode: "PHP", dateFormat: "MM/DD/YYYY", numberFormat: "comma-dot" },
  { name: "Indonesia", code: "ID", currencyCode: "IDR", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Thailand", code: "TH", currencyCode: "THB", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Vietnam", code: "VN", currencyCode: "VND", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "China", code: "CN", currencyCode: "CNY", dateFormat: "YYYY-MM-DD", numberFormat: "comma-dot" },
  { name: "Japan", code: "JP", currencyCode: "JPY", dateFormat: "YYYY-MM-DD", numberFormat: "comma-dot" },
  { name: "South Korea", code: "KR", currencyCode: "KRW", dateFormat: "YYYY-MM-DD", numberFormat: "comma-dot" },
  { name: "Taiwan", code: "TW", currencyCode: "TWD", dateFormat: "YYYY-MM-DD", numberFormat: "comma-dot" },
  { name: "United Arab Emirates", code: "AE", currencyCode: "AED", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Saudi Arabia", code: "SA", currencyCode: "SAR", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Qatar", code: "QA", currencyCode: "QAR", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Kuwait", code: "KW", currencyCode: "KWD", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Bahrain", code: "BH", currencyCode: "BHD", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Oman", code: "OM", currencyCode: "OMR", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Jordan", code: "JO", currencyCode: "JOD", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Lebanon", code: "LB", currencyCode: "LBP", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Israel", code: "IL", currencyCode: "ILS", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Turkey", code: "TR", currencyCode: "TRY", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Egypt", code: "EG", currencyCode: "EGP", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Morocco", code: "MA", currencyCode: "MAD", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Nigeria", code: "NG", currencyCode: "NGN", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Ghana", code: "GH", currencyCode: "GHS", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Kenya", code: "KE", currencyCode: "KES", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Tanzania", code: "TZ", currencyCode: "TZS", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Uganda", code: "UG", currencyCode: "UGX", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Ethiopia", code: "ET", currencyCode: "ETB", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Zambia", code: "ZM", currencyCode: "ZMW", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Botswana", code: "BW", currencyCode: "BWP", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Mauritius", code: "MU", currencyCode: "MUR", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "South Africa", code: "ZA", currencyCode: "ZAR", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Germany", code: "DE", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "France", code: "FR", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Italy", code: "IT", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Spain", code: "ES", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Netherlands", code: "NL", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Belgium", code: "BE", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Portugal", code: "PT", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Austria", code: "AT", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Switzerland", code: "CH", currencyCode: "CHF", dateFormat: "DD/MM/YYYY", numberFormat: "space-dot" },
  { name: "Luxembourg", code: "LU", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Sweden", code: "SE", currencyCode: "SEK", dateFormat: "YYYY-MM-DD", numberFormat: "space-comma" },
  { name: "Norway", code: "NO", currencyCode: "NOK", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Denmark", code: "DK", currencyCode: "DKK", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Finland", code: "FI", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Iceland", code: "IS", currencyCode: "ISK", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Poland", code: "PL", currencyCode: "PLN", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Czechia", code: "CZ", currencyCode: "CZK", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Slovakia", code: "SK", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Hungary", code: "HU", currencyCode: "HUF", dateFormat: "YYYY-MM-DD", numberFormat: "space-comma" },
  { name: "Romania", code: "RO", currencyCode: "RON", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Bulgaria", code: "BG", currencyCode: "BGN", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Greece", code: "GR", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Croatia", code: "HR", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Slovenia", code: "SI", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Serbia", code: "RS", currencyCode: "RSD", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Ukraine", code: "UA", currencyCode: "UAH", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Russia", code: "RU", currencyCode: "RUB", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Estonia", code: "EE", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Latvia", code: "LV", currencyCode: "EUR", dateFormat: "DD/MM/YYYY", numberFormat: "space-comma" },
  { name: "Lithuania", code: "LT", currencyCode: "EUR", dateFormat: "YYYY-MM-DD", numberFormat: "space-comma" },
  { name: "Mexico", code: "MX", currencyCode: "MXN", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Brazil", code: "BR", currencyCode: "BRL", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Argentina", code: "AR", currencyCode: "ARS", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Chile", code: "CL", currencyCode: "CLP", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Colombia", code: "CO", currencyCode: "COP", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Peru", code: "PE", currencyCode: "PEN", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Uruguay", code: "UY", currencyCode: "UYU", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Costa Rica", code: "CR", currencyCode: "CRC", dateFormat: "DD/MM/YYYY", numberFormat: "dot-comma" },
  { name: "Panama", code: "PA", currencyCode: "PAB", dateFormat: "MM/DD/YYYY", numberFormat: "comma-dot" },
  { name: "Dominican Republic", code: "DO", currencyCode: "DOP", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
  { name: "Guatemala", code: "GT", currencyCode: "GTQ", dateFormat: "DD/MM/YYYY", numberFormat: "comma-dot" },
];

/** Alphabetical, safe to map directly into a `<select>`. */
export const COUNTRIES: CountryConvention[] = [...RAW_COUNTRIES].sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function findCountry(code: string): CountryConvention | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

/**
 * Currency display presets offered as chips. The first entry is the default
 * chosen when a country is picked, and is always ASCII / WinAnsi-safe so it
 * renders in the PDF even when the "real" symbol (₨, ₹, ₦, ₩, ฿…) would not.
 * Currencies not listed fall back to just their ISO code.
 */
const CURRENCY_PRESETS: Record<string, string[]> = {
  USD: ["$", "US$", "USD"],
  EUR: ["€", "EUR"],
  GBP: ["£", "GBP"],
  CAD: ["C$", "CA$", "$", "CAD"],
  AUD: ["A$", "AU$", "$", "AUD"],
  NZD: ["NZ$", "$", "NZD"],
  CHF: ["CHF", "Fr."],
  SEK: ["kr", "SEK"],
  NOK: ["kr", "NOK"],
  DKK: ["kr", "DKK"],
  PLN: ["zł", "PLN"],
  CZK: ["Kč", "CZK"],
  HUF: ["Ft", "HUF"],
  RON: ["lei", "RON"],
  INR: ["Rs.", "₹", "INR"],
  PKR: ["Rs.", "₨", "PKR"],
  BDT: ["Tk", "৳", "BDT"],
  LKR: ["Rs.", "LKR", "₨"],
  NPR: ["Rs.", "NPR", "₨"],
  SGD: ["S$", "$", "SGD"],
  MYR: ["RM", "MYR"],
  HKD: ["HK$", "$", "HKD"],
  PHP: ["PHP", "₱", "P"],
  IDR: ["Rp", "IDR"],
  THB: ["THB", "฿", "B"],
  VND: ["VND", "₫", "d"],
  CNY: ["¥", "CN¥", "RMB", "CNY"],
  JPY: ["¥", "JPY"],
  KRW: ["KRW", "₩", "W"],
  TWD: ["NT$", "$", "TWD"],
  AED: ["AED", "Dhs", "د.إ"],
  SAR: ["SAR", "SR", "﷼"],
  QAR: ["QAR", "QR"],
  KWD: ["KWD", "KD"],
  BHD: ["BHD", "BD"],
  OMR: ["OMR", "RO"],
  JOD: ["JOD", "JD"],
  ILS: ["ILS", "₪", "NIS"],
  TRY: ["TL", "₺", "TRY"],
  EGP: ["EGP", "E£", "LE"],
  MAD: ["MAD", "DH"],
  NGN: ["NGN", "₦", "N"],
  GHS: ["GHS", "GH₵", "GH¢"],
  KES: ["KSh", "KES"],
  TZS: ["TSh", "TZS"],
  UGX: ["USh", "UGX"],
  ZMW: ["ZK", "ZMW"],
  ZAR: ["R", "ZAR"],
  BWP: ["P", "BWP"],
  MUR: ["Rs.", "MUR"],
  ETB: ["Br", "ETB"],
  MXN: ["$", "MX$", "MXN"],
  BRL: ["R$", "BRL"],
  ARS: ["$", "AR$", "ARS"],
  CLP: ["$", "CLP"],
  COP: ["$", "COP"],
  PEN: ["S/", "PEN"],
  UYU: ["$U", "UYU"],
  CRC: ["CRC", "₡", "C"],
  PAB: ["B/.", "PAB"],
  DOP: ["RD$", "DOP"],
  GTQ: ["Q", "GTQ"],
  RUB: ["RUB", "₽", "R"],
  UAH: ["UAH", "₴"],
  RSD: ["RSD", "din."],
  BGN: ["lv", "BGN"],
  ISK: ["kr", "ISK"],
};

/** Chip options for the currency-display picker for a given ISO code. */
export function currencyDisplayOptions(currencyCode: string): string[] {
  return CURRENCY_PRESETS[currencyCode] ?? [currencyCode];
}

/** The default display string when a currency is first chosen. */
export function defaultCurrencyDisplay(currencyCode: string): string {
  return currencyDisplayOptions(currencyCode)[0] ?? currencyCode;
}
