import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CompanyProfile } from "@/lib/company-profile";
import {
  COUNTRIES,
  DATE_FORMAT_OPTIONS,
  NUMBER_FORMAT_OPTIONS,
  currencyDisplayOptions,
  defaultCurrencyDisplay,
  findCountry,
  formatDate,
  formatMoney,
} from "@/lib/locale-format";

const selectClass =
  "h-9 w-full rounded-sm border border-border bg-card px-2 text-sm text-foreground";

// Fixed samples for the "How does this show on invoice?" preview. The date is
// the 5th of February so DD/MM vs MM/DD is unmistakable.
const PREVIEW_AMOUNT = 52889.5;
const PREVIEW_DATE = "2026-02-05";

/** The exact slice of the Company Profile this section reads and writes. */
export type CurrencyFormatValue = Pick<
  CompanyProfile,
  "country" | "currencyCode" | "currencyDisplay" | "dateFormat" | "numberFormat"
>;

type Props = {
  value: CurrencyFormatValue;
  /** Merge a partial patch into the profile draft the caller owns. */
  onChange: (patch: Partial<CurrencyFormatValue>) => void;
};

/**
 * The Country / Currency display / Date format / Number format controls plus
 * the live "How does this show on invoice?" preview. Shared verbatim between
 * the full Company Details dialog and the focused "Currency Settings" dialog
 * so both edit the same fields with identical UI — the caller just supplies
 * the current value and a patch handler.
 */
export function CurrencyFormatSection({ value, onChange }: Props) {
  // Picking a country seeds the currency + date + number format with that
  // region's common convention. Every one stays editable afterwards.
  const handleCountryChange = (code: string) => {
    const c = findCountry(code);
    if (!c) {
      onChange({ country: code });
      return;
    }
    onChange({
      country: c.code,
      currencyCode: c.currencyCode,
      currencyDisplay: defaultCurrencyDisplay(c.currencyCode),
      dateFormat: c.dateFormat,
      numberFormat: c.numberFormat,
    });
  };

  const displayPresets = currencyDisplayOptions(value.currencyCode);
  const previewPrefs = {
    currencyDisplay: value.currencyDisplay,
    dateFormat: value.dateFormat,
    numberFormat: value.numberFormat,
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="cp-country">Country</Label>
        <select
          id="cp-country"
          className={selectClass}
          value={value.country}
          onChange={(e) => handleCountryChange(e.target.value)}
        >
          <option value="">Select a country…</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-muted-foreground">
          Sets sensible defaults below — you can still change each one.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Currency display</Label>
        <div className="flex flex-wrap gap-1.5">
          {displayPresets.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={value.currencyDisplay === opt}
              onClick={() => onChange({ currencyDisplay: opt })}
              className={cn(
                "rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                value.currencyDisplay === opt
                  ? "border-primary bg-accent text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        <Input
          aria-label="Custom currency display"
          value={value.currencyDisplay}
          onChange={(e) => onChange({ currencyDisplay: e.target.value })}
          placeholder="or type your own, e.g. Rs."
          className="mt-1"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cp-datefmt">Date format</Label>
          <select
            id="cp-datefmt"
            className={selectClass}
            value={value.dateFormat}
            onChange={(e) =>
              onChange({ dateFormat: e.target.value as CompanyProfile["dateFormat"] })
            }
          >
            {DATE_FORMAT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-numfmt">Number format</Label>
          <select
            id="cp-numfmt"
            className={selectClass}
            value={value.numberFormat}
            onChange={(e) =>
              onChange({ numberFormat: e.target.value as CompanyProfile["numberFormat"] })
            }
          >
            {NUMBER_FORMAT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.sample}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live preview — updates as the dropdowns/chips change, before Save. */}
      <div className="rounded-sm border border-border bg-card p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          How does this show on invoice?
        </p>
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold text-foreground">
              {formatMoney(PREVIEW_AMOUNT, previewPrefs)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Date</span>
            <span className="font-semibold text-foreground">
              {formatDate(PREVIEW_DATE, value.dateFormat)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
