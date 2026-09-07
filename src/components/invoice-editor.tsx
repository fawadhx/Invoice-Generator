import { useEffect, useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { computeTotals, type Invoice, type InvoiceItem as Item } from "@/lib/invoice";
import {
  applyCompanyProfile,
  emptyCompanyProfile,
  loadCompanyProfile,
  saveCompanyProfile,
  type CompanyProfile,
} from "@/lib/company-profile";
import { CompanyProfileDialog } from "@/components/company-profile-dialog";
import { DEFAULT_TEMPLATE_ID, getInvoiceTemplate, invoiceTemplateList } from "@/templates";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const today = new Date();
const due = new Date(today);
due.setDate(today.getDate() + 14);

const initial: Invoice = {
  business: "",
  address: "",
  from: "",
  fromPhone: "",
  to: "",
  toPhone: "",
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
  selectedTemplate: DEFAULT_TEMPLATE_ID,
};

export function InvoiceEditor() {
  const [inv, setInv] = useState<Invoice>(initial);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  // The persisted business identity. Lives under its own localStorage key,
  // is never touched by "Clear invoice", and only the overlay writes it.
  const [profile, setProfile] = useState<CompanyProfile>(emptyCompanyProfile);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    // Start from the last saved invoice (if any)…
    let base = initial;
    const stored = localStorage.getItem("rapidai-invoice");
    if (stored) {
      try {
        base = { ...base, ...JSON.parse(stored) } as Invoice;
      } catch {
        /* ignore corrupt data */
      }
    }
    // …then let the saved Company Profile fill any field still left blank.
    const savedProfile = loadCompanyProfile();
    if (savedProfile) {
      setProfile(savedProfile);
      base = applyCompanyProfile(base, savedProfile);
    }
    setInv(base);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(
      () => localStorage.setItem("rapidai-invoice", JSON.stringify(inv)),
      400,
    );
    return () => window.clearTimeout(timer);
  }, [inv]);

  // ---- Editing layer: state + patch functions + calculations ----
  // This is template-agnostic. Templates never touch it; they receive the
  // invoice plus these handlers and render the editable document surface.
  const patch = (values: Partial<Invoice>) => setInv((c) => ({ ...c, ...values }));
  const setItem = (id: number, key: keyof Item, value: string) =>
    patch({
      items: inv.items.map((i) =>
        i.id === id ? { ...i, [key]: key === "name" ? value : Number(value) } : i,
      ),
    });
  const addItem = () =>
    patch({ items: [...inv.items, { id: Date.now(), name: "", qty: 1, rate: 0 }] });
  const removeItem = (id: number) => patch({ items: inv.items.filter((i) => i.id !== id) });
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

  // ---- Visual layer: the swappable template ----
  // `selectedTemplate` decides which layout renders the invoice on screen and
  // which design the PDF exporter draws. No picker UI yet — change the state
  // value (React DevTools, or the default above) to swap templates live.
  const template = getInvoiceTemplate(inv.selectedTemplate);
  const Layout = template.Layout;

  // Overlay "Save": persist the profile, keep it in state, and let it fill
  // any field the current invoice has left blank (never overwrites typed-in
  // values — see `applyCompanyProfile`).
  const handleProfileSave = (next: CompanyProfile) => {
    saveCompanyProfile(next);
    setProfile(next);
    setInv((current) => applyCompanyProfile(current, next));
  };

  const handleClearInvoice = () => {
    localStorage.removeItem("rapidai-invoice");
    // Reset the per-invoice fields only, then re-apply the saved profile so a
    // fresh invoice still starts from the business identity.
    const blank: Invoice = {
      ...initial,
      selectedTemplate: inv.selectedTemplate,
      items: [{ id: Date.now(), name: "", qty: 1, rate: 0 }],
    };
    setInv(applyCompanyProfile(blank, profile));
  };

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
        <Layout
          inv={inv}
          totals={totals}
          patch={patch}
          setItem={setItem}
          addItem={addItem}
          removeItem={removeItem}
          onLogo={onLogo}
          onEditProfile={() => setProfileOpen(true)}
        />

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
            <p className="text-xs font-medium text-muted-foreground">Template</p>
            <div className="grid gap-1.5">
              {invoiceTemplateList.map((tpl) => {
                const active = tpl.id === inv.selectedTemplate;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => patch({ selectedTemplate: tpl.id })}
                    className={cn(
                      "rounded-sm border px-3 py-2 text-left transition-colors",
                      active
                        ? "border-primary bg-accent text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    <span className="block text-sm font-medium">{tpl.name}</span>
                    <span className="mt-0.5 block text-[11px] leading-4">{tpl.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 rounded-sm border border-border bg-card p-4">
            <Button variant="ghost" size="sm" className="w-full" onClick={handleClearInvoice}>
              Clear invoice
            </Button>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            No signup. Your details are saved only in this browser.
          </p>
        </aside>
      </div>

      <CompanyProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={profile}
        onSave={handleProfileSave}
      />
    </>
  );
}
