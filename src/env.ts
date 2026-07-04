/**
 * The three environments Vercel sets out of the box, plus any custom name —
 * Vercel custom environments (and manual `FAVICON_ENV` overrides) can use
 * arbitrary names like "staging" or "qa". The `string & {}` keeps
 * autocomplete for the standard three while accepting custom values.
 */
export type FaviconEnv = 'production' | 'preview' | 'development' | (string & {});

/**
 * Evaluates one env read, tolerating environments where `process` doesn't
 * exist (plain browsers, workers). Each read is isolated so a bundler that
 * inlined one variable still wins even if a sibling read throws.
 */
function safeRead(read: () => string | undefined): string | undefined {
  try {
    return read();
  } catch {
    return undefined;
  }
}

/**
 * Detects which environment the app is running in, using the same values
 * Vercel sets on `VERCEL_ENV` / `NEXT_PUBLIC_VERCEL_ENV`: "production",
 * "preview", or "development".
 *
 * Resolution order:
 * 1. `VERCEL_ENV` / `NEXT_PUBLIC_VERCEL_ENV` (set automatically on Vercel)
 * 2. `FAVICON_ENV` / `NEXT_PUBLIC_FAVICON_ENV` (manual override, e.g. on other hosts)
 * 3. `NODE_ENV === 'production'` ? "production" : "development"
 *
 * Any non-empty value is accepted, not just the standard three — Vercel
 * custom environments set `VERCEL_ENV` to the custom name (e.g. "staging"),
 * and those flow through to per-environment favicon config keys.
 *
 * Every access below must stay a literal `process.env.X` member expression —
 * bundlers (Next.js, webpack DefinePlugin, esbuild/Vite `define`) inline env
 * values into browser bundles by matching that exact syntax, and a dynamic
 * `process.env[name]` lookup would never be replaced, making client-side
 * detection silently fall back to "development".
 */
export function detectFaviconEnv(): FaviconEnv {
  const vercelEnv =
    safeRead(() => process.env.VERCEL_ENV) ??
    safeRead(() => process.env.NEXT_PUBLIC_VERCEL_ENV);
  if (vercelEnv) return vercelEnv;

  const override =
    safeRead(() => process.env.FAVICON_ENV) ??
    safeRead(() => process.env.NEXT_PUBLIC_FAVICON_ENV);
  if (override) return override;

  return safeRead(() => process.env.NODE_ENV) === 'production' ? 'production' : 'development';
}
