import type { Invoice } from "./invoice";

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
};

export const COMPANY_PROFILE_KEY = "rapidai-company-profile";

export const emptyCompanyProfile: CompanyProfile = {
  logo: "",
  signatureUrl: "",
  signatureType: null,
  businessName: "",
  address: "",
  email: "",
  phone: "",
};

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
    return { ...emptyCompanyProfile, ...parsed };
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
  if (!next.business.trim() && p.businessName.trim()) next.business = p.businessName;
  if (!next.logo && p.logo) next.logo = p.logo;
  if (!next.address.trim() && p.address.trim()) next.address = p.address;
  if (!next.fromPhone.trim() && p.phone.trim()) next.fromPhone = p.phone;
  if (!next.from.trim()) {
    // The "Bill from" free-text block — placeholder "Name, address, email".
    // Compose it from the structured profile so the sender's address and
    // email still land on the invoice without adding more rendered fields.
    const composed = [p.address.trim(), p.email.trim()].filter(Boolean).join("\n");
    if (composed) next.from = composed;
  }
  return next;
}
