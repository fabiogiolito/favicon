import type { FaviconEnv } from './env.js';
import { badgeSvg, recolorSvg, svgToDataUri } from './svg.js';

/** A single SVG template recolored for one environment via `currentColor`. */
export interface SvgFaviconSource {
  type: 'svg';
  svg: string;
  /** Color substituted for `currentColor` in the SVG. Omit to use the SVG as-is. */
  color?: string;
}

/** An explicit favicon file: a PNG/ICO/SVG path, or an already-built data URI. */
export interface UrlFaviconSource {
  type: 'url';
  href: string;
  /** MIME type for the `<link>` tag. Guessed from the file extension if omitted. */
  mimeType?: string;
}

export type FaviconSource = SvgFaviconSource | UrlFaviconSource | string;

/**
 * One favicon source per environment. Only `production` is required; any
 * other key — the standard `preview`/`development` or custom environment
 * names like `staging` — is matched against the detected environment.
 */
export interface FaviconConfig {
  production: FaviconSource;
  preview?: FaviconSource;
  development?: FaviconSource;
  [env: string]: FaviconSource | undefined;
}

export interface ResolvedFavicon {
  href: string;
  mimeType?: string;
}

/**
 * Default per-environment badge/tint colors: amber for previews, green for
 * local development. Production intentionally has no entry — it shows the
 * icon untouched.
 */
export const DEFAULT_ENV_COLORS: Record<string, string> = {
  preview: '#f59e0b',
  development: '#22c55e',
};

const EXTENSION_MIME_TYPES: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
};

function guessMimeType(href: string): string | undefined {
  const match = /\.[a-z0-9]+$/i.exec(href.split('?')[0] ?? '');
  return match ? EXTENSION_MIME_TYPES[match[0].toLowerCase()] : undefined;
}

function normalizeFaviconSource(source: FaviconSource): ResolvedFavicon {
  if (typeof source === 'string') {
    return { href: source, mimeType: guessMimeType(source) };
  }

  if (source.type === 'svg') {
    const svg = source.color ? recolorSvg(source.svg, source.color) : source.svg;
    return { href: svgToDataUri(svg), mimeType: 'image/svg+xml' };
  }

  return { href: source.href, mimeType: source.mimeType ?? guessMimeType(source.href) };
}

/**
 * Picks the favicon source for the given environment and normalizes it into
 * a `{ href, mimeType }` pair ready for a `<link rel="icon">` tag.
 *
 * Fallback order: the environment's own entry, then `preview` for any
 * non-production environment (so an unconfigured staging/QA deploy is still
 * visually marked as "not production"), then `production`.
 */
export function resolveFavicon(config: FaviconConfig, env: FaviconEnv): ResolvedFavicon {
  const source =
    config[env] ?? (env !== 'production' ? config.preview : undefined) ?? config.production;
  return normalizeFaviconSource(source);
}

/**
 * Zero-config helper: takes your existing favicon SVG and overlays a
 * colored corner dot per environment, leaving production untouched.
 * Defaults to an amber dot on previews and a green dot in development;
 * pass your own map to change colors or add custom environments.
 *
 * @example
 * createBadgeFaviconConfig(icon); // amber dot on preview, green on dev
 * createBadgeFaviconConfig(icon, { staging: '#8b5cf6', development: '#22c55e' });
 */
export function createBadgeFaviconConfig(
  svg: string,
  colors: Record<string, string> = DEFAULT_ENV_COLORS,
): FaviconConfig {
  const config: FaviconConfig = { production: { type: 'svg', svg } };
  for (const [env, color] of Object.entries(colors)) {
    config[env] = { type: 'svg', svg: badgeSvg(svg, color) };
  }
  return config;
}

/**
 * Builds a `FaviconConfig` from a single `currentColor` SVG template plus a
 * color per environment (standard or custom names). The same artwork is
 * reused everywhere; only the fill color changes. Environments without a
 * color entry fall back per {@link resolveFavicon}; if `production` has no
 * entry the SVG is used as-is (a bare `currentColor` renders black).
 */
export function createColorFaviconConfig(
  svg: string,
  colors: Record<string, string> = DEFAULT_ENV_COLORS,
): FaviconConfig {
  const config: FaviconConfig = {
    production: { type: 'svg', svg, color: colors.production },
  };
  for (const [env, color] of Object.entries(colors)) {
    if (env === 'production') continue;
    config[env] = { type: 'svg', svg, color };
  }
  return config;
}
