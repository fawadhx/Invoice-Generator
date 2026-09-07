import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "./__root";

const TITLE = "Privacy Policy | Free Invoice Generator";
const DESCRIPTION =
  "How Free Invoice Generator handles your data: invoices are stored only in your browser, there are no accounts, and we do not sell your information.";
const UPDATED = "7 September 2026";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/privacy#webpage`,
      url: `${SITE_URL}/privacy`,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
      dateModified: "2026-09-07",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Privacy Policy", item: `${SITE_URL}/privacy` },
      ],
    },
  ],
};

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/privacy` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-12 lg:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            Home
          </a>{" "}
          / <span aria-current="page">Privacy Policy</span>
        </nav>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: {UPDATED}</p>

        <p className="text-sm leading-6 text-muted-foreground">
          This Privacy Policy explains how FreeInvoiceMaking (&ldquo;we&rdquo;, &ldquo;us&rdquo;)
          handles information when you use the Free Invoice Generator website at{" "}
          <a href="/" className="underline hover:text-foreground">
            freeinvoicemaking.com
          </a>{" "}
          (the &ldquo;Service&rdquo;). By using the Service you agree to this policy.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">1. The short version</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The invoice you create is processed entirely in your browser. We do not have user
          accounts, we do not upload or store your invoices on our servers, and we do not sell your
          personal information.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">2. Information you enter into an invoice</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Details you type into the invoice form — such as your business name, client name,
          addresses, line items, logo image and amounts — are kept in your browser&rsquo;s local
          storage so your work is still there when you return. This data never leaves your device
          through the Service. Clearing your browser storage, or using the &ldquo;Clear
          invoice&rdquo; action, removes it. The PDF you download is generated locally by your
          browser&rsquo;s print function.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">3. Local storage (not cookies)</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We use browser local storage, not tracking cookies. Two items are stored: your most
          recent invoice and your light/dark theme preference. These are readable only by your
          browser on this site and are not transmitted to us.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">4. Server logs and hosting</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The Service is delivered through a third-party hosting and content-delivery provider
          (Cloudflare). Like most websites, the hosting provider may automatically process standard
          technical request data such as your IP address, browser type and the page requested, for
          security, abuse prevention and reliability. We do not use this data to identify you.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">5. Web fonts</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The site loads a typeface from Google Fonts. When your browser requests these font files,
          Google may receive your IP address and user-agent string. See Google&rsquo;s privacy
          policy for details on how they handle that request.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">6. Analytics and advertising</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          At the time of the &ldquo;last updated&rdquo; date above, the Service does not run
          third-party analytics or advertising scripts. If we add privacy-respecting analytics or
          advertising in future, we will update this policy and, where required by law, ask for
          your consent first.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">7. Children</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The Service is intended for business use by adults and is not directed at children under
          13.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">8. Your rights</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Because we do not hold your invoice data on our servers, most data-subject requests can
          be satisfied by you directly through your browser settings. If you have a privacy
          question or believe data has been processed incorrectly, contact us and we will help.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">9. Changes to this policy</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We may update this policy from time to time. Material changes will be reflected by a new
          &ldquo;last updated&rdquo; date on this page.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">10. Contact</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Questions about this policy? Email{" "}
          <a href="mailto:support@freeinvoicemaking.com" className="underline hover:text-foreground">
            support@freeinvoicemaking.com
          </a>{" "}
          or use our{" "}
          <a href="/contact" className="underline hover:text-foreground">
            Contact page
          </a>
          . See also our{" "}
          <a href="/terms" className="underline hover:text-foreground">
            Terms &amp; Conditions
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
