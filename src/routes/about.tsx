import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "./__root";

const TITLE = "About Us | Free Invoice Generator";
const DESCRIPTION =
  "Learn about Free Invoice Generator — a free, no-signup online invoice maker built to help freelancers and small businesses send professional invoices in under a minute.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#webpage`,
      url: `${SITE_URL}/about`,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#org` },
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "About Us", item: `${SITE_URL}/about` },
      ],
    },
  ],
};

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/about` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-12 lg:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            Home
          </a>{" "}
          / <span aria-current="page">About Us</span>
        </nav>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">About Free Invoice Generator</h1>

        <p className="text-sm leading-6 text-muted-foreground">
          Free Invoice Generator is a free online invoice maker for freelancers, contractors,
          consultants and small businesses. It was built around a single idea: creating an invoice
          and getting paid should take a minute, not an afternoon of wrestling with accounting
          software or spreadsheet templates.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">What we do</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Our tool lets you build a clean, professional invoice directly in your browser — add your
          logo, your business and client details, line items, tax, discount and amount paid — then
          download it as a PDF you can email to your client. There is no signup, no trial timer and
          no watermark on your document. Every currency total, including subtotal, tax and balance
          due, is calculated automatically as you type.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">Our approach to your data</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The invoice you build is stored only in your own browser using local storage. We do not
          run user accounts, we do not upload your invoices to a server, and we do not sell data.
          You can read the full details in our{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>

        <h2 className="text-lg font-semibold tracking-tight">Who is behind it</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Free Invoice Generator is operated by FreeInvoiceMaking, an independent software project.
          We fund development through unobtrusive advertising and optional future features, which is
          how the core invoice generator stays free for everyone. If you have feedback, a bug
          report or a feature request, we would like to hear it — visit our{" "}
          <a href="/contact" className="underline hover:text-foreground">
            Contact page
          </a>
          .
        </p>

        <h2 className="text-lg font-semibold tracking-tight">Start creating an invoice</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Ready to send your next invoice?{" "}
          <a href="/" className="underline hover:text-foreground">
            Open the free invoice generator
          </a>{" "}
          and download a professional PDF in under a minute.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
