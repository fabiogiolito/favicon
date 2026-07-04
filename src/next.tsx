import Head from 'next/head';
import { detectFaviconEnv } from './env.js';
import { resolveFavicon, type FaviconConfig } from './config.js';

/**
 * Builds the `icons` field of Next.js App Router metadata
 * (https://nextjs.org/docs/app/api-reference/functions/generate-metadata#icons)
 * for the current environment. Runs on the server, so it can read
 * `VERCEL_ENV` directly without needing the `NEXT_PUBLIC_` prefix.
 *
 * @example
 * // app/layout.tsx
 * import type { Metadata } from 'next';
 * import { getFaviconMetadata } from 'env-favicon/next';
 * import { faviconConfig } from './favicon.config';
 *
 * export const metadata: Metadata = {
 *   icons: getFaviconMetadata(faviconConfig),
 * };
 */
export function getFaviconMetadata(config: FaviconConfig) {
  const { href, mimeType } = resolveFavicon(config, detectFaviconEnv());
  return {
    icon: [{ url: href, type: mimeType }],
  };
}

export interface FaviconHeadProps {
  config: FaviconConfig;
}

/**
 * Pages Router equivalent of {@link getFaviconMetadata}: drop this in
 * `pages/_app.tsx` (or any page) to inject the right `<link rel="icon">`
 * via `next/head`.
 *
 * @example
 * // pages/_app.tsx
 * import { FaviconHead } from 'env-favicon/next';
 * import { faviconConfig } from '../favicon.config';
 *
 * export default function App({ Component, pageProps }: AppProps) {
 *   return (
 *     <>
 *       <FaviconHead config={faviconConfig} />
 *       <Component {...pageProps} />
 *     </>
 *   );
 * }
 */
export function FaviconHead({ config }: FaviconHeadProps) {
  const { href, mimeType } = resolveFavicon(config, detectFaviconEnv());
  return (
    <Head>
      <link rel="icon" href={href} type={mimeType} />
    </Head>
  );
}
