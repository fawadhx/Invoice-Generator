import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { InvoiceEditor } from "@/components/invoice-editor";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "./__root";

const FAQ = [
  {
    q: "Is this invoice generator really free?",
    a: "Yes. This is a 100% free invoice generator and invoice maker. There is no signup, no trial, no watermark and no limit on how many invoices you create or download.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. It is a free online invoice generator that works instantly in your browser. Fill in the fields, download the PDF and you are done — no email or account required.",
  },
  {
    q: "How do I download my invoice as a PDF?",
    a: 'Click "Download Invoice". The invoice is generated as a clean, professional PDF and downloads straight to your device — no print dialog — ready to email to your client.',
  },
  {
    q: "Can I add my company logo and set my currency?",
    a: "Yes. Upload your logo, then pick your country to set the currency, date format and number format automatically — or type in any currency symbol you like. Add tax, discount and amount paid, and the balance due is calculated for you.",
  },
  {
    q: "Is my invoice data private?",
    a: "Yes. This free invoice maker app stores your details only in your own browser using local storage. Nothing is uploaded to a server and nothing is shared.",
  },
  {
    q: "Can I reuse it as a free invoice template?",
    a: "Yes. Your last invoice is saved locally, so you can reopen the page, change the client and line items, and send a new invoice in seconds — a reusable free invoice template.",
  },
];

const GUIDE_FAQ = [
  {
    q: "What is an invoice?",
    a: "An invoice is a document a seller sends to a buyer that lists the goods or services provided, their prices and the total amount owed. It is a formal request for payment and a record of the transaction for both sides. You can create one in seconds with this free invoice generator.",
  },
  {
    q: "What is included in an invoice?",
    a: "A complete invoice includes the word \"Invoice\", a unique invoice number, the issue date and due date, the seller's name, address and contact details, the client's name and address, an itemised list of goods or services with quantity and rate, the subtotal, any tax or discount, the total amount due, and accepted payment methods.",
  },
  {
    q: "How do I create an invoice?",
    a: "Start with your business name and logo, add your details and the client's details, give the invoice a number and an issue date, list each item with its quantity and rate, then add tax or discount so the totals are calculated for you. With this invoice maker you fill in the fields and download a finished PDF in under a minute.",
  },
  {
    q: "How do I make an invoice for free?",
    a: "Open this free invoice maker, type in your business and client details, add your line items, then click Download Invoice to save the finished PDF. There is no signup, no watermark and no limit on how many invoices you make.",
  },
  {
    q: "Is an invoice a bill or a receipt?",
    a: "An invoice is closest to a bill: it is issued before payment to tell the customer what they owe. A receipt is different — it is issued after payment as proof that the money was received.",
  },
  {
    q: "What are the two main types of invoices?",
    a: "The two most common are the standard (or sales) invoice, used for a normal one-off sale, and the recurring invoice, used to bill the same amount on a regular schedule such as a monthly retainer or subscription.",
  },
  {
    q: "What are the three types of invoices?",
    a: "Commonly cited types are the proforma invoice (an estimate sent before work begins), the standard or commercial invoice (the actual request for payment), and the credit note (a negative invoice that refunds or cancels part of a previous one). Interim and final invoices are also widely used on larger projects.",
  },
  {
    q: 'Does "invoice" mean paid?',
    a: 'No. An invoice is a request for payment, not confirmation of it. It stays unpaid until the customer sends the money; once settled it is usually marked "Paid" or matched with a receipt.',
  },
  {
    q: "How is invoice payment done?",
    a: "The customer pays using one of the methods listed on the invoice — bank transfer, card, PayPal, cheque or cash — quoting the invoice number as a reference. Payment is due by the date on the invoice, often 15 or 30 days from the issue date.",
  },
  {
    q: "Who gives an invoice?",
    a: "The seller, supplier, freelancer or contractor who provided the goods or services issues the invoice to the customer or client who received them.",
  },
  {
    q: "Who writes the invoice?",
    a: "The person or business being paid writes the invoice. That may be the owner, a bookkeeper or an accountant, or it can be generated automatically with an invoice generator.",
  },
  {
    q: "How do I use an invoice?",
    a: "Send it to your client once the work is delivered, keep a copy for your records, and use the invoice number to track whether it has been paid. Your client uses it to check the charges and process payment.",
  },
  {
    q: "What is a formal invoice?",
    a: "A formal invoice is a finalised, legally valid invoice with a unique number, issue date, full seller and buyer details, itemised charges and the total due. It differs from a proforma invoice, which is only a preliminary quote.",
  },
  {
    q: "Why is it called an invoice?",
    a: 'The word comes from the Middle French "envois", meaning "things sent". It originally referred to a list of goods dispatched to a buyer, and over time came to mean the document requesting payment for them.',
  },
  {
    q: "What comes first, an order or an invoice?",
    a: "The order comes first: the customer places a purchase order or agrees to the work. The invoice comes afterwards, once the goods or services have been delivered.",
  },
  {
    q: "How do I fill in and complete an invoice?",
    a: "Fill in every field: your details, the client's details, a unique invoice number, the issue and due dates, and each line item with quantity and rate. Then add tax, discount and any amount already paid, and check that the total and balance due are correct before you send it.",
  },
  {
    q: "How should an invoice look?",
    a: "Use a clean, single-page layout: your logo and business name at the top, clearly separated “from” and “to” blocks, a table of line items with amounts, and the total due highlighted at the bottom. Keep fonts simple and leave white space so it is easy to read.",
  },
  {
    q: "What is the best format for an invoice?",
    a: "PDF is the best file format to send, because it looks the same on every device and cannot be edited by accident. Build the invoice online, then download it as a PDF to email to your client.",
  },
  {
    q: "When should I send an invoice?",
    a: "Send the invoice as soon as the work is finished or the goods are delivered — the sooner it goes out, the sooner you are paid. For long projects, send interim invoices at agreed milestones.",
  },
  {
    q: "Does an invoice need a due date?",
    a: 'It is not always legally required, but every invoice should include one. A clear due date such as "due within 14 days" sets payment expectations and makes it easier to follow up on late payments.',
  },
  {
    q: "Is it mandatory to issue an invoice?",
    a: "It depends on your country and your customer. Businesses registered for VAT or GST, and most business-to-business sales, are legally required to issue invoices; for casual sales to consumers a receipt may be enough. Issuing an invoice is good practice either way.",
  },
  {
    q: "What is the best free invoice maker?",
    a: "The best free invoice maker is one that needs no signup, adds no watermark and lets you download unlimited PDFs. This tool is built for exactly that — a fast, free invoice generator that runs entirely in your browser.",
  },
  {
    q: "What are the best invoice maker tools?",
    a: "For a quick one-off invoice, a free online invoice generator like this one is the fastest option. Businesses that also need expense tracking and reporting often use paid suites such as FreshBooks, Wave, Zoho Invoice or QuickBooks. If you just need a professional PDF now, the free tool is the quickest route.",
  },
];

/**
 * Collapsible FAQ list. Uses native <details>/<summary> so every question and
 * answer stays in the server-rendered HTML (collapsed by CSS, not lazy-loaded)
 * and remains keyboard accessible without extra JS. Each item opens/closes
 * independently; all start collapsed.
 */
function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-md border border-border [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-medium">
            <span>{item.q}</span>
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <p className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Free Invoice Generator",
      alternateName: ["Free Invoice Maker", "Online Invoice Generator"],
      url: `${SITE_URL}/`,
      description:
        "Free online invoice generator and invoice maker. Create a professional invoice and download the PDF in under 60 seconds — no signup, no watermark.",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Invoicing",
      operatingSystem: "Any (web browser)",
      browserRequirements: "Requires JavaScript",
      inLanguage: "en-US",
      isAccessibleForFree: true,
      datePublished: "2026-09-07",
      dateModified: "2026-09-07",
      softwareVersion: "1.0",
      screenshot: `${SITE_URL}/og-image.png`,
      image: `${SITE_URL}/og-image.png`,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Create invoices online for free",
        "Download invoices as PDF",
        "Add company logo",
        "Automatic tax, discount and balance due",
        "Any currency, date format and number format — pick your country or set your own",
        "No signup and no watermark",
      ],
      publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Free Invoice Generator",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/web-app-manifest-512x512.png`,
      email: "support@freeinvoicemaking.com",
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@freeinvoicemaking.com",
        contactType: "customer support",
        availableLanguage: ["English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Free Invoice Generator",
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: "Free Invoice Generator – Make & Download Invoices Online",
      description:
        "Free online invoice generator and invoice maker. Create a professional invoice and download the PDF in under 60 seconds — no signup, no watermark.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#app` },
      primaryImageOfPage: `${SITE_URL}/og-image.png`,
      inLanguage: "en-US",
      datePublished: "2026-09-07",
      dateModified: "2026-09-07",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      inLanguage: "en-US",
      isPartOf: { "@id": `${SITE_URL}/#webpage` },
      mainEntity: [...FAQ, ...GUIDE_FAQ].map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: `<p>${item.a}</p>` },
      })),
    },
    {
      "@type": "HowTo",
      name: "How to create an invoice online for free",
      description:
        "Create and download a professional invoice in under a minute with a free online invoice generator.",
      inLanguage: "en-US",
      totalTime: "PT1M",
      image: `${SITE_URL}/og-image.png`,
      supply: { "@type": "HowToSupply", name: "Your business and client details" },
      tool: { "@type": "HowToTool", name: "Free Invoice Generator" },
      step: [
        {
          "@type": "HowToStep",
          name: "Add your business details",
          text: "Enter your business name, upload your logo and fill in the 'Bill from' details.",
        },
        {
          "@type": "HowToStep",
          name: "Add the client and line items",
          text: "Enter who the invoice is to, then add each service or product with quantity and rate.",
        },
        {
          "@type": "HowToStep",
          name: "Set tax, discount and dates",
          text: "Add any tax percentage, discount, amount paid, invoice number and due date. Totals update automatically.",
        },
        {
          "@type": "HowToStep",
          name: "Download the PDF",
          text: "Click Download Invoice to save the finished PDF, then send it to your client.",
        },
      ],
    },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Free Invoice Generator – Make & Download Invoices Online | No Signup",
      },
      {
        name: "description",
        content:
          "Free online invoice generator and invoice maker. Create a professional invoice and download the PDF in under 60 seconds — no signup, no watermark, free forever.",
      },
      {
        property: "og:title",
        content: "Free Invoice Generator – Make & Download Invoices Online",
      },
      {
        property: "og:description",
        content:
          "Create a professional invoice and download the PDF in under 60 seconds. Free online invoice maker — no signup, no watermark.",
      },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLd),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="border-b border-border bg-card print:hidden">
          <div className="mx-auto max-w-5xl px-4 py-10 text-center lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Free Invoice Generator — make an invoice online in seconds
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              A free online invoice maker with no signup and no accounting software. Fill in the
              invoice below, add your logo, and download a professional PDF.
            </p>
            <nav
              aria-label="Site pages"
              className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm"
            >
              <a href="#invoice-sheet" className="font-medium text-primary hover:underline">
                Create an invoice
              </a>
              <span aria-hidden="true" className="text-border">
                •
              </span>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">
                About Us
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                Terms &amp; Conditions
              </Link>
            </nav>
          </div>
        </section>

        <InvoiceEditor />

        <section
          className="border-t border-border bg-card print:hidden"
          aria-labelledby="about-heading"
        >
          <div className="mx-auto max-w-3xl space-y-10 px-4 py-14 lg:px-6">
            <div className="space-y-4">
              <h2 id="about-heading" className="text-xl font-semibold tracking-tight">
                The free invoice generator built for speed
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                This <strong>invoice generator</strong> helps freelancers, contractors, small
                businesses and solopreneurs send a clean, professional invoice without the weight of
                traditional accounting software. It is a genuinely{" "}
                <strong>free invoice generator</strong> — there is no paywall, no trial timer and no
                watermark stamped across your PDF. Because the whole tool runs in your browser, you
                can go from a blank page to a finished invoice in under a minute.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Most people looking for an <strong>online invoice generator</strong> just want to
                bill a client and get paid. That is exactly what this{" "}
                <strong>free online invoice generator</strong> is designed for. Type your business
                name, upload a logo, add your client, list the work you did, and the subtotal, tax,
                discount and balance due are calculated for you automatically as you type.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Why use this free invoice maker?
              </h2>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                <li>
                  <strong>Free invoice maker with no signup</strong> — start immediately, no account
                  or email required.
                </li>
                <li>
                  <strong>Invoice maker free of watermarks</strong> — your PDF shows your brand, not
                  ours.
                </li>
                <li>
                  <strong>Best free invoice maker for speed</strong> — a single page, no dashboards,
                  no menus to learn.
                </li>
                <li>
                  <strong>Online invoice maker</strong> that works on desktop, laptop, tablet and
                  phone.
                </li>
                <li>
                  Bill in any currency — pick your country to set the currency symbol, date format
                  and number format, or enter a custom symbol of your own.
                </li>
                <li>
                  Automatic totals for quantity, rate, tax percentage, discount and amount paid.
                </li>
                <li>Private by design — your details are saved only in your own browser.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">
                How to create an invoice online
              </h2>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                <li>
                  Add your business name and logo, then fill in your &ldquo;Bill from&rdquo; address
                  and email.
                </li>
                <li>
                  Enter the client under &ldquo;Bill to&rdquo;, plus a shipping address if you need
                  one.
                </li>
                <li>
                  Add each line item with a description, quantity and rate — the amount is worked
                  out for you.
                </li>
                <li>
                  Set the invoice number, date, payment terms and due date, then add tax, discount
                  or amount paid.
                </li>
                <li>
                  Click <strong>Download Invoice</strong> to save the finished PDF and send a{" "}
                  <strong>quick invoice</strong> to your client.
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">
                A free invoice template you can reuse
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Every invoice you build here doubles as a reusable{" "}
                <strong>free invoice template</strong>. Your last invoice is stored locally, so the
                next time you need to bill someone you can reopen this page, swap the client and
                line items, and export a new PDF in seconds. There is nothing to download or install
                and no <strong>invoice template</strong> file to manage — the template is the tool.
                If you prefer a dedicated <strong>free invoice maker app</strong> experience, you
                can also add this page to your home screen and it will open like an app.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Whether you call it an <strong>invoice generator</strong>, an{" "}
                <strong>invoice maker free</strong> tool, or a{" "}
                <strong>free online invoice maker</strong>, the goal is the same: a professional
                invoice, ready to send, with as little friction as possible.
              </p>
            </div>

            <div className="space-y-4">
              <h2 id="faq" className="text-xl font-semibold tracking-tight">
                Frequently asked questions
              </h2>
              <FaqList items={FAQ} />
            </div>

            <div className="space-y-4">
              <h2 id="invoice-faq" className="text-xl font-semibold tracking-tight">
                Invoicing FAQ: how invoices work
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Common questions about what an invoice is, what to put on it, and how to send it and
                get paid — plus how this <strong>free invoice generator</strong> fits in.
              </p>
              <FaqList items={GUIDE_FAQ} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
