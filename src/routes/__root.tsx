import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ErrorState } from "../components/error-state";

/** Production origin — update if the domain changes. */
export const SITE_URL = "https://freeinvoicemaking.com";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

function NotFoundComponent() {
  return (
    <ErrorState
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved. It may have been renamed, or the link that brought you here is out of date."
    />
  );
}

/** Pull an HTTP status code out of whatever the router boundary caught. */
function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof Response) return error.status;
  if (error != null && typeof error === "object") {
    const value =
      (error as { status?: unknown }).status ?? (error as { statusCode?: unknown }).statusCode;
    if (typeof value === "number") return value;
  }
  return undefined;
}

const GENERIC_ERROR_COPY = {
  title: "Something went wrong",
  description:
    "Something went wrong on our end while loading this page. Your invoice data is saved in your browser and is safe — try again or head back to the generator.",
};

const ERROR_COPY: Record<number, { title: string; description: string }> = {
  400: {
    title: "Bad request",
    description: "The request couldn't be understood. Try again from the invoice generator.",
  },
  401: {
    title: "Not authorised",
    description: "You don't have access to this page.",
  },
  403: {
    title: "Access denied",
    description: "You don't have permission to view this page.",
  },
  429: {
    title: "Too many requests",
    description: "You've made a lot of requests in a short time. Wait a moment and try again.",
  },
  500: GENERIC_ERROR_COPY,
  503: {
    title: "Service unavailable",
    description: "The site is temporarily unavailable. Please try again in a few minutes.",
  },
};

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const status = getErrorStatus(error) ?? 500;
  const copy = ERROR_COPY[status] ?? GENERIC_ERROR_COPY;

  return (
    <ErrorState
      code={String(status)}
      title={copy.title}
      description={copy.description}
      onRetry={() => {
        router.invalidate();
        reset();
      }}
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Free Invoice Generator – Make & Download Invoices Online | No Signup",
      },
      {
        name: "description",
        content:
          "Free online invoice generator and invoice maker. Create a professional invoice and download the PDF in under 60 seconds — no signup, no watermark, free forever.",
      },
      {
        name: "keywords",
        content:
          "invoice generator, free invoice generator, invoice generator free, online invoice generator, free online invoice generator, invoice maker, free invoice maker, invoice maker free, online invoice maker, free online invoice maker, best free invoice maker, free invoice maker app, quick invoice, free invoice template, invoice template",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "author", content: "FreeInvoiceMaking" },
      { name: "application-name", content: "Free Invoice Generator" },
      { name: "generator", content: "Free Invoice Generator" },
      { name: "format-detection", content: "telephone=no" },
      { name: "apple-mobile-web-app-title", content: "Free Invoice" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },

      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Free Invoice Generator" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: `${SITE_URL}/` },
      {
        property: "og:title",
        content: "Free Invoice Generator – Make & Download Invoices Online",
      },
      {
        property: "og:description",
        content:
          "Create a professional invoice and download the PDF in under 60 seconds. Free online invoice maker — no signup, no watermark.",
      },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:secure_url", content: OG_IMAGE },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Free Invoice Generator — create and download invoices online",
      },

      // twitter:title / twitter:description are intentionally omitted so X/Twitter
      // falls back to the per-page og:title / og:description on every route.
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
      {
        name: "twitter:image:alt",
        content: "Free Invoice Generator — create and download invoices online",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-SDS35WV7TH",
        async: true,
      },
      {
        children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-SDS35WV7TH');`,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#171717" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k="rapidai-theme";var s=localStorage.getItem(k);var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(e){}})();`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
