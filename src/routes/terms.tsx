import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "./__root";

const TITLE = "Terms & Conditions | Free Invoice Generator";
const DESCRIPTION =
  "The terms of use for the Free Invoice Generator website — a free, browser-based invoice maker provided as-is, with no warranty and no professional advice.";
const UPDATED = "7 September 2026";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/terms#webpage`,
      url: `${SITE_URL}/terms`,
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Terms & Conditions",
          item: `${SITE_URL}/terms`,
        },
      ],
    },
  ],
};

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/terms` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-12 lg:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            Home
          </a>{" "}
          / <span aria-current="page">Terms &amp; Conditions</span>
        </nav>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Terms &amp; Conditions</h1>
        <p className="text-xs text-muted-foreground">Last updated: {UPDATED}</p>

        <p className="text-sm leading-6 text-muted-foreground">
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use of the Free Invoice
          Generator website at{" "}
          <a href="/" className="underline hover:text-foreground">
            freeinvoicemaking.com
          </a>{" "}
          (the &ldquo;Service&rdquo;), operated by FreeInvoiceMaking. By using the Service you agree
          to these Terms. If you do not agree, please do not use the Service.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">1. The Service</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The Service is a free, browser-based tool that lets you create and download invoice
          documents as PDFs. It runs in your browser; we do not host accounts or store your invoice
          content on our servers.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">2. Acceptable use</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          You agree to use the Service only for lawful purposes. You must not use it to create
          fraudulent, misleading or unlawful documents, to infringe the rights of others, or to
          attempt to disrupt, overload, reverse-engineer or gain unauthorised access to the
          Service or its infrastructure.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">3. Your content</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          You retain all rights to the information and documents you create with the Service. You
          are solely responsible for the accuracy, legality and tax treatment of the invoices you
          generate and send.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">4. No professional advice</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The Service and any accompanying text are provided for general information only and do
          not constitute accounting, tax or legal advice. Invoice and tax requirements vary by
          country and situation; consult a qualified professional where needed.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">5. Availability</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We aim to keep the Service available but do not guarantee that it will be uninterrupted,
          error-free or permanently available. We may change, suspend or discontinue any part of
          the Service at any time without notice.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">6. Intellectual property</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The Service&rsquo;s design, code, branding and content are owned by FreeInvoiceMaking or
          its licensors and are protected by applicable laws. These Terms do not grant you any
          right to use our trademarks or branding.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">7. Disclaimer of warranties</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
          warranties of any kind, whether express or implied, including fitness for a particular
          purpose and non-infringement.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">8. Limitation of liability</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          To the maximum extent permitted by law, FreeInvoiceMaking will not be liable for any
          indirect, incidental or consequential losses, or for any loss of data, revenue or
          profits, arising from your use of or inability to use the Service.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">9. Changes to these Terms</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We may update these Terms from time to time. Continued use of the Service after changes
          take effect constitutes acceptance of the revised Terms.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">10. Contact</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Questions about these Terms? Email{" "}
          <a href="mailto:support@freeinvoicemaking.com" className="underline hover:text-foreground">
            support@freeinvoicemaking.com
          </a>{" "}
          or use our{" "}
          <a href="/contact" className="underline hover:text-foreground">
            Contact page
          </a>
          . See also our{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
