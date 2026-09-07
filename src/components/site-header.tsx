import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";

/** Shared site header with brand + primary navigation, used on every page. */
export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card print:hidden">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Free Invoice Generator — home">
          <img
            src="/logo.png"
            alt="Free Invoice Generator logo"
            width={28}
            height={28}
            className="h-7 w-7 rounded-md object-contain"
          />
          <span className="text-sm font-semibold">Free Invoice Generator</span>
        </Link>
        <nav aria-label="Primary" className="ml-auto flex items-center gap-4 text-sm">
          <Link
            to="/about"
            className="hidden text-muted-foreground hover:text-foreground sm:inline"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="hidden text-muted-foreground hover:text-foreground sm:inline"
          >
            Contact
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
