import { useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const POPULAR_PAGES = [
  { to: "/", label: "Invoice Generator" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
] as const;

type ErrorStateProps = {
  /** HTTP-style status shown large at the top, e.g. "404" or "500". */
  code: string;
  /** Short document + page title, e.g. "Page not found". */
  title: string;
  /** One or two sentences explaining what happened. */
  description: ReactNode;
  /** Optional retry handler — renders a "Try again" button when provided. */
  onRetry?: () => void;
};

/**
 * Shared, on-brand error screen used by the 404 and the root error boundary.
 * Keeps the site header/footer so a visitor who lands on an error still has
 * working navigation, and marks the page noindex so search engines skip it.
 */
export function ErrorState({ code, title, description, onRetry }: ErrorStateProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Free Invoice Generator`;

    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, follow";
    document.head.appendChild(robots);

    return () => {
      document.title = previousTitle;
      document.head.removeChild(robots);
    };
  }, [title]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center lg:px-6">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Error {code}
        </p>
        <h1 className="mt-2 text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
          {code}
        </h1>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try again
            </button>
          )}
          <Link
            to="/"
            className={
              onRetry
                ? "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                : "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            }
          >
            Go to the invoice generator
          </Link>
        </div>

        <div className="mt-10 w-full border-t border-border pt-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Popular pages
          </p>
          <nav
            aria-label="Popular pages"
            className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
          >
            {POPULAR_PAGES.map((page) => (
              <Link
                key={page.to}
                to={page.to}
                className="text-muted-foreground hover:text-foreground"
              >
                {page.label}
              </Link>
            ))}
          </nav>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
