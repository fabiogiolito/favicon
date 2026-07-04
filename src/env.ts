export type FaviconEnv = 'production' | 'preview' | 'development';

const VALID_ENVS: readonly FaviconEnv[] = ['production', 'preview', 'development'];

function isFaviconEnv(value: string | undefined): value is FaviconEnv {
  return !!value && (VALID_ENVS as readonly string[]).includes(value);
}

function readEnv(name: string): string | undefined {
  if (typeof process === 'undefined' || !process.env) return undefined;
  return process.env[name];
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
 */
export function detectFaviconEnv(): FaviconEnv {
  const vercelEnv = readEnv('VERCEL_ENV') ?? readEnv('NEXT_PUBLIC_VERCEL_ENV');
  if (isFaviconEnv(vercelEnv)) return vercelEnv;

  const override = readEnv('FAVICON_ENV') ?? readEnv('NEXT_PUBLIC_FAVICON_ENV');
  if (isFaviconEnv(override)) return override;

  return readEnv('NODE_ENV') === 'production' ? 'production' : 'development';
}
