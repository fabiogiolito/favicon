import { detectFaviconEnv } from './env.js';

export interface FaviconRewrite {
  source: string;
  destination: string;
}

/**
 * File-based alternative to the React/metadata helpers: returns a rewrite
 * that serves a per-environment favicon file at the standard favicon URL.
 * Because rewrites resolve on the server, this needs no client-side env
 * vars and also covers browsers' automatic `/favicon.ico` requests.
 *
 * Returns an empty array in production (or when the environment has no
 * file), so the real favicon is served untouched. Non-production
 * environments without their own file fall back to the `preview` entry.
 *
 * @example
 * // next.config.ts
 * import { faviconRewrites } from 'env-favicon';
 *
 * export default {
 *   async rewrites() {
 *     return {
 *       beforeFiles: faviconRewrites({
 *         preview: '/favicon.preview.ico',
 *         development: '/favicon.development.ico',
 *       }),
 *     };
 *   },
 * };
 */
export function faviconRewrites(
  files: Record<string, string>,
  options: { source?: string } = {},
): FaviconRewrite[] {
  const { source = '/favicon.ico' } = options;
  const env = detectFaviconEnv();
  const destination = files[env] ?? (env !== 'production' ? files.preview : undefined);
  if (!destination || destination === source) return [];
  return [{ source, destination }];
}
