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
import type { CompanyProfile } from "@/lib/company-profile";

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
