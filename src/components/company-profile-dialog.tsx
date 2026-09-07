import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Eraser, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatInvoiceNumber, hasInvoiceNumbering, type CompanyProfile } from "@/lib/company-profile";
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

// Fixed samples for the "How does this show on invoice?" preview. The date is
// the 5th of February so DD/MM vs MM/DD is unmistakable.
const PREVIEW_AMOUNT = 52889.5;
const PREVIEW_DATE = "2026-02-05";

const selectClass =
  "h-9 w-full rounded-sm border border-border bg-card px-2 text-sm text-foreground";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: CompanyProfile;
  /** Persist the profile and close the overlay. */
  onSave: (profile: CompanyProfile) => void;
};

type SigMode = "upload" | "draw";

// Signature canvas bitmap size. Displayed responsively; strokes are stored
// at this resolution so the exported data URL stays crisp.
const SIG_W = 600;
const SIG_H = 180;
const SIG_STROKE = "#1e293b";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

/**
 * "Company Details" overlay — a shortcut to fill the whole saved business
 * identity (logo, name, address, email, phone, signature) in one place.
 * Editing here is the *only* path that writes the persisted Company Profile;
 * the inline invoice fields never flow back into it.
 *
 * The draft lives in local state and is only lifted on Save, so Cancel (or
 * dismissing the dialog) discards every change.
 */
export function CompanyProfileDialog({ open, onOpenChange, profile, onSave }: Props) {
  const [draft, setDraft] = useState<CompanyProfile>(profile);
  const [sigMode, setSigMode] = useState<SigMode>(
    profile.signatureType === "upload" ? "upload" : "draw",
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  // Reset the draft every time the dialog is (re)opened.
  useEffect(() => {
    if (!open) return;
    setDraft(profile);
    setSigMode(profile.signatureType === "upload" ? "upload" : "draw");
  }, [open, profile]);

  // Prepare the drawing surface: clear it, set the pen, and re-draw an
  // existing hand-drawn signature so it can be touched up rather than redone.
  useEffect(() => {
    if (!open || sigMode !== "draw") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = SIG_STROKE;
    if (draft.signatureType === "drawn" && draft.signatureUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = draft.signatureUrl;
    }
  }, [open, sigMode, draft.signatureType, draft.signatureUrl]);

  const pointFromEvent = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    canvasRef.current?.setPointerCapture(e.pointerId);
    const { x, y } = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointFromEvent(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    drawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDraft((d) => ({
      ...d,
      signatureUrl: canvas.toDataURL("image/png"),
      signatureType: "drawn",
    }));
  };

  const handleLogoFile = async (file?: File) => {
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setDraft((d) => ({ ...d, logo: url }));
  };

  const handleSignatureFile = async (file?: File) => {
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setDraft((d) => ({ ...d, signatureUrl: url, signatureType: "upload" }));
  };

  const removeSignature = () => {
    setDraft((d) => ({ ...d, signatureUrl: "", signatureType: null }));
    if (sigMode === "draw") clearCanvas();
  };

  // Picking a country seeds the currency + date + number format with that
  // region's common convention. Every one stays editable afterwards.
  const handleCountryChange = (code: string) => {
    const c = findCountry(code);
    if (!c) {
      setDraft((d) => ({ ...d, country: code }));
      return;
    }
    setDraft((d) => ({
      ...d,
      country: c.code,
      currencyCode: c.currencyCode,
      currencyDisplay: defaultCurrencyDisplay(c.currencyCode),
      dateFormat: c.dateFormat,
      numberFormat: c.numberFormat,
    }));
  };

  const displayPresets = currencyDisplayOptions(draft.currencyCode);
  const previewPrefs = {
    currencyDisplay: draft.currencyDisplay,
    dateFormat: draft.dateFormat,
    numberFormat: draft.numberFormat,
  };

  const handleSave = () => {
    onSave(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Company details</DialogTitle>
          <DialogDescription>
            Saved once in this browser and auto-filled into every new invoice. This does not change
            invoices you have already started, and it survives “Clear invoice”.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Logo */}
          <div className="space-y-1.5">
            <Label>Logo</Label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleLogoFile(e.target.files?.[0])}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex h-16 w-32 items-center justify-center gap-2 rounded-sm border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary"
              >
                {draft.logo ? (
                  <img
                    src={draft.logo}
                    alt="Logo preview"
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Upload
                  </>
                )}
              </button>
              {draft.logo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDraft((d) => ({ ...d, logo: "" }))}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Business name */}
          <div className="space-y-1.5">
            <Label htmlFor="cp-name">Business name</Label>
            <Input
              id="cp-name"
              value={draft.businessName}
              onChange={(e) => setDraft((d) => ({ ...d, businessName: e.target.value }))}
              placeholder="Your business name"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="cp-address">Address</Label>
            <Textarea
              id="cp-address"
              value={draft.address}
              onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
              placeholder={"Street\nCity, State, Country"}
              rows={3}
            />
          </div>

          {/* Email + phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cp-email">Email</Label>
              <Input
                id="cp-email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="you@business.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-phone">Phone</Label>
              <Input
                id="cp-phone"
                type="tel"
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </div>
          </div>

          {/* Currency & format */}
          <div className="space-y-3 rounded-sm border border-border bg-muted/30 p-3">
            <div>
              <Label className="text-sm font-semibold">Currency &amp; format</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Applied to every invoice in this browser. There is no per-invoice override.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cp-country">Country</Label>
              <select
                id="cp-country"
                className={selectClass}
                value={draft.country}
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
                    aria-pressed={draft.currencyDisplay === opt}
                    onClick={() => setDraft((d) => ({ ...d, currencyDisplay: opt }))}
                    className={cn(
                      "rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                      draft.currencyDisplay === opt
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
                value={draft.currencyDisplay}
                onChange={(e) => setDraft((d) => ({ ...d, currencyDisplay: e.target.value }))}
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
                  value={draft.dateFormat}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      dateFormat: e.target.value as CompanyProfile["dateFormat"],
                    }))
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
                  value={draft.numberFormat}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      numberFormat: e.target.value as CompanyProfile["numberFormat"],
                    }))
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
                    {formatDate(PREVIEW_DATE, draft.dateFormat)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice numbering */}
          <div className="space-y-3 rounded-sm border border-border bg-muted/30 p-3">
            <div>
              <Label className="text-sm font-semibold">Invoice numbering</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Set a prefix to number new invoices automatically. Leave the prefix blank to keep
                typing invoice numbers yourself.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="cp-prefix">Prefix</Label>
                <Input
                  id="cp-prefix"
                  value={draft.invoicePrefix}
                  onChange={(e) => setDraft((d) => ({ ...d, invoicePrefix: e.target.value }))}
                  placeholder="INV-"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-nextnum">Next number</Label>
                <Input
                  id="cp-nextnum"
                  type="number"
                  min={1}
                  value={draft.nextInvoiceNumber}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      nextInvoiceNumber: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-padding">Pad to</Label>
                <Input
                  id="cp-padding"
                  type="number"
                  min={0}
                  max={10}
                  value={draft.numberPadding}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      numberPadding: Math.min(10, Math.max(0, Math.floor(Number(e.target.value) || 0))),
                    }))
                  }
                />
              </div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Next invoice number
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {hasInvoiceNumbering(draft) ? (
                  formatInvoiceNumber(draft, draft.nextInvoiceNumber)
                ) : (
                  <span className="font-normal text-muted-foreground">
                    Manual — you enter it on each invoice
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <Label>Signature</Label>
            <div className="flex gap-1.5">
              {(["draw", "upload"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={sigMode === mode}
                  onClick={() => setSigMode(mode)}
                  className={cn(
                    "rounded-sm border px-3 py-1 text-xs font-medium capitalize transition-colors",
                    sigMode === mode
                      ? "border-primary bg-accent text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode === "draw" ? "Draw" : "Upload image"}
                </button>
              ))}
            </div>

            {sigMode === "draw" ? (
              <div className="space-y-2">
                <canvas
                  ref={canvasRef}
                  width={SIG_W}
                  height={SIG_H}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                  className="h-40 w-full touch-none rounded-sm border border-border bg-white"
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={clearCanvas}>
                    <Eraser /> Clear
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={saveDrawing}>
                    Save drawing
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  ref={sigInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleSignatureFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => sigInputRef.current?.click()}
                  className="flex h-24 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Upload className="h-4 w-4" /> Upload signature image
                </button>
              </div>
            )}

            {draft.signatureUrl && (
              <div className="flex items-center gap-3 rounded-sm border border-border bg-muted/40 p-2">
                <img
                  src={draft.signatureUrl}
                  alt="Signature preview"
                  className="h-12 w-auto max-w-[60%] rounded-sm bg-white object-contain px-1"
                />
                <span className="text-xs text-muted-foreground">
                  Saved ({draft.signatureType === "upload" ? "uploaded" : "drawn"})
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={removeSignature}
                >
                  <Trash2 /> Remove
                </Button>
              </div>
            )}
          </div>

          {/* Payable To & banking details */}
          <div className="space-y-3 rounded-sm border border-border bg-muted/30 p-3">
            <div>
              <Label className="text-sm font-semibold">Payable to &amp; banking details</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Optional. Once filled in, this prints as a footer on every invoice (and the PDF).
                Leave it all blank to hide it.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cp-payable-to">Payable to</Label>
              <Input
                id="cp-payable-to"
                value={draft.payableTo}
                onChange={(e) => setDraft((d) => ({ ...d, payableTo: e.target.value }))}
                placeholder="Who the payment is made out to"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cp-bank-name">Bank name</Label>
                <Input
                  id="cp-bank-name"
                  value={draft.bankName}
                  onChange={(e) => setDraft((d) => ({ ...d, bankName: e.target.value }))}
                  placeholder="e.g. Meezan Bank"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-account-title">Account title</Label>
                <Input
                  id="cp-account-title"
                  value={draft.accountTitle}
                  onChange={(e) => setDraft((d) => ({ ...d, accountTitle: e.target.value }))}
                  placeholder="Account holder name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-account-number">Account number</Label>
                <Input
                  id="cp-account-number"
                  value={draft.accountNumber}
                  onChange={(e) => setDraft((d) => ({ ...d, accountNumber: e.target.value }))}
                  placeholder="Account number"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-iban">IBAN</Label>
                <Input
                  id="cp-iban"
                  value={draft.iban}
                  onChange={(e) => setDraft((d) => ({ ...d, iban: e.target.value }))}
                  placeholder="IBAN"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cp-banking-note">Note</Label>
              <Textarea
                id="cp-banking-note"
                value={draft.bankingNote}
                onChange={(e) => setDraft((d) => ({ ...d, bankingNote: e.target.value }))}
                placeholder="e.g. Share receipt after payment"
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
