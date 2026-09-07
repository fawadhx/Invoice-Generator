import { Link } from "@tanstack/react-router";

/** Shared site footer with internal links to every page, used on every page. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card print:hidden">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-center text-xs text-muted-foreground lg:px-6">
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/" className="hover:text-foreground">
            Invoice Generator
          </Link>
          <Link to="/about" className="hover:text-foreground">
            About Us
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact Us
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms &amp; Conditions
          </Link>
        </nav>
        <div className="space-y-1">
          <p>
            Free Invoice Generator — a free online invoice maker for freelancers and small
            businesses.
          </p>
          <p>No signup. No watermark. Your data stays in your browser.</p>
          <p>&copy; {new Date().getFullYear()} FreeInvoiceMaking. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
