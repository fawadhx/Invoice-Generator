import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * The read-only invoice document — the caller renders the selected template
   * with `preview` set, so this dialog stays purely about presentation and
   * never touches invoice state.
   */
  children: ReactNode;
};

/**
 * A modal wrapper around the read-only invoice preview. It shows exactly what
 * the exported PDF will look like without disturbing the editing view beneath
 * it: there is no view-state to get stuck in — closing the dialog (the X, a
 * click outside, Esc, or the Close button) simply returns to editing untouched.
 *
 * Styling mirrors the other overlays in this app (`company-profile-dialog`,
 * `currency-settings-dialog`): centred, inset from the screen edge on every
 * size, capped at 90vh and scrollable.
 */
export function InvoicePreviewDialog({ open, onOpenChange, children }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice preview</DialogTitle>
          <DialogDescription>
            Read-only — this is how your downloaded PDF will look. Close to keep editing.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-sm bg-muted/30 p-3 sm:p-4">{children}</div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
