import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CurrencyFormatSection } from "@/components/currency-format-section";
import type { CompanyProfile } from "@/lib/company-profile";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: CompanyProfile;
  /** Persist the profile and close — identical to saving the full dialog. */
  onSave: (profile: CompanyProfile) => void;
};

/**
 * A focused shortcut into just the currency / date / number formatting on the
 * saved Company Profile, opened from the "Change" link in the top summary bar.
 * It reads and writes the exact same `CompanyProfile` fields as the full
 * Company Details dialog — there is no separate store, and saving here runs
 * the same `onSave` path. The draft is local until Save, so dismissing
 * discards changes.
 */
export function CurrencySettingsDialog({ open, onOpenChange, profile, onSave }: Props) {
  const [draft, setDraft] = useState<CompanyProfile>(profile);

  // Reset the draft every time the dialog is (re)opened.
  useEffect(() => {
    if (open) setDraft(profile);
  }, [open, profile]);

  const handleSave = () => {
    onSave(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Currency Settings</DialogTitle>
          <DialogDescription>
            Currency, date and number formatting for every invoice in this browser. There is no
            per-invoice override.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <CurrencyFormatSection
            value={draft}
            onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
