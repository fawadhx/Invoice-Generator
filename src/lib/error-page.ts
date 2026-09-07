type ErrorPageOptions = {
  /** HTTP status code — shown large and used for the default copy. */
  status?: number;
  /** Overrides the heading. */
  title?: string;
  /** Overrides the body sentence. */
  description?: string;
};

const GENERIC_COPY = {
  title: "This page didn't load",
  description: "Something went wrong on our end. You can try refreshing or head back home.",
};

const DEFAULT_COPY: Record<number, { title: string; description: string }> = {
  404: {
    title: "Page not found",
    description: "The page you're looking for doesn't exist or has been moved.",
  },
  500: GENERIC_COPY,
  503: {
    title: "Service unavailable",
    description: "The site is temporarily unavailable. Please try again in a few minutes.",
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Standalone HTML error page for failures that happen before (or instead of)
 * a React render — SSR crashes, h3-swallowed 500s. Self-contained: no CSS,
 * JS or font dependencies, and theme-aware via prefers-color-scheme.
 */
export function renderErrorPage(options: ErrorPageOptions = {}): string {
  const status = options.status ?? 500;
  const fallback = DEFAULT_COPY[status] ?? GENERIC_COPY;
  const title = escapeHtml(options.title ?? fallback.title);
  const description = escapeHtml(options.description ?? fallback.description);
  const showReload = status >= 500;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title} | Free Invoice Generator</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, follow" />
    <style>
      :root { color-scheme: light dark; --bg: #fafafa; --fg: #111827; --muted: #6b7280; --border: #e5e7eb; --card: #fff; --accent: #111827; --accent-fg: #fff; }
      @media (prefers-color-scheme: dark) {
        :root { --bg: #171717; --fg: #f5f5f5; --muted: #a1a1aa; --border: #2e2e2e; --card: #1f1f1f; --accent: #f5f5f5; --accent-fg: #171717; }
      }
      * { box-sizing: border-box; }
      body { font: 15px/1.6 "Geist", system-ui, -apple-system, Segoe UI, sans-serif; background: var(--bg); color: var(--fg); display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 30rem; width: 100%; text-align: center; }
      .code { font-size: 3.5rem; font-weight: 700; letter-spacing: -0.02em; margin: 0; line-height: 1; }
      .label { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin: 0 0 0.5rem; }
      h1 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
      p { color: var(--muted); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; font-weight: 500; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: var(--accent); color: var(--accent-fg); }
      .secondary { background: var(--card); color: var(--fg); border-color: var(--border); }
      .links { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
      .links p { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem; }
      .links nav { display: flex; gap: 1.25rem; justify-content: center; flex-wrap: wrap; }
      .links a { padding: 0; border: 0; color: var(--muted); font-weight: 400; }
      .links a:hover { color: var(--fg); }
    </style>
  </head>
  <body>
    <div class="card">
      <p class="label">Error ${status}</p>
      <p class="code">${status}</p>
      <h1>${title}</h1>
      <p>${description}</p>
      <div class="actions">
        ${showReload ? '<button class="primary" onclick="location.reload()">Try again</button>' : ""}
        <a class="${showReload ? "secondary" : "primary"}" href="/">Go to the invoice generator</a>
      </div>
      <div class="links">
        <p>Popular pages</p>
        <nav>
          <a href="/">Invoice Generator</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact Us</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms &amp; Conditions</a>
        </nav>
      </div>
    </div>
  </body>
</html>`;
}
