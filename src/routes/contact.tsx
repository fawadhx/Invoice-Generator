import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "./__root";

const TITLE = "Contact Us | Free Invoice Generator";
const DESCRIPTION =
  "Get in touch with the Free Invoice Generator team. Send feedback, bug reports, feature requests or partnership enquiries by email.";
const SUPPORT_EMAIL = "support@freeinvoicemaking.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${SITE_URL}/contact#webpage`,
      url: `${SITE_URL}/contact`,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#org` },
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Free Invoice Generator",
      url: `${SITE_URL}/`,
      email: SUPPORT_EMAIL,
      contactPoint: {
        "@type": "ContactPoint",
        email: SUPPORT_EMAIL,
        contactType: "customer support",
        availableLanguage: ["English"],
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Contact Us", item: `${SITE_URL}/contact` },
      ],
    },
  ],
};

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/contact` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-12 lg:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            Home
          </a>{" "}
          / <span aria-current="page">Contact Us</span>
        </nav>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Contact us</h1>

        <p className="text-sm leading-6 text-muted-foreground">
          We would love to hear from you. Whether you have found a bug in the invoice generator,
          want to request a feature, have a question about how your data is handled, or want to
          discuss a partnership, send us an email and we will get back to you.
        </p>

        <div className="rounded-md border border-border p-5">
          <h2 className="text-sm font-medium">Email</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-foreground">
              {SUPPORT_EMAIL}
            </a>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            We aim to reply to written enquiries within 3–5 business days.
          </p>
        </div>

        <h2 className="text-lg font-semibold tracking-tight">What to include</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          <li>For a bug report: the browser and device you were using and the steps to reproduce it.</li>
          <li>For a feature request: what you were trying to do and how the current tool got in the way.</li>
          <li>For a privacy question: reference our{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>{" "}
            so we can point you to the relevant section.
          </li>
        </ul>

        <p className="text-sm leading-6 text-muted-foreground">
          Looking for the tool itself?{" "}
          <a href="/" className="underline hover:text-foreground">
            Open the free invoice generator
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
