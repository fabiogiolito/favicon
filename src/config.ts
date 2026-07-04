import type { FaviconEnv } from './env.js';
import { recolorSvg, svgToDataUri } from './svg.js';

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

export interface FaviconConfig {
  production: FaviconSource;
  preview?: FaviconSource;
  development?: FaviconSource;
}

export interface ResolvedFavicon {
  href: string;
  mimeType?: string;
}

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
 * Falls back to `config.production` when `preview`/`development` aren't set,
 * so you only need to configure the environments you want to customize.
 */
export function resolveFavicon(config: FaviconConfig, env: FaviconEnv): ResolvedFavicon {
  const source = config[env] ?? config.production;
  return normalizeFaviconSource(source);
}

/**
 * Builds a `FaviconConfig` from a single `currentColor` SVG template plus a
 * color per environment. The same artwork is reused everywhere; only the
 * fill color changes.
 */
export function createColorFaviconConfig(
  svg: string,
  colors: { production: string; preview?: string; development?: string },
): FaviconConfig {
  const toSource = (color: string | undefined): SvgFaviconSource => ({ type: 'svg', svg, color });

  return {
    production: toSource(colors.production),
    preview: colors.preview ? toSource(colors.preview) : undefined,
    development: colors.development ? toSource(colors.development) : undefined,
  };
}
