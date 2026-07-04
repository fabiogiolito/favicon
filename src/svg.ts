/**
 * Replaces `currentColor` tokens in an SVG source with a literal color.
 *
 * Data URIs have no CSS cascade, so `currentColor`/CSS variables never
 * resolve — this lets a single SVG act as a themable template: draw it with
 * `fill="currentColor"` (or `stroke="currentColor"`) and swap in a real
 * color per environment at build/render time.
 */
export function recolorSvg(svg: string, color: string): string {
  return svg.replace(/currentColor/g, color);
}

const BADGE_CANVAS = 100;

/**
 * Rewrites the root `<svg>` tag to render at a fixed pixel size so it can be
 * nested inside a badge wrapper. Only the root tag is touched; any existing
 * width/height attributes are dropped (the SVG's viewBox handles scaling).
 */
function forceRootSize(svg: string, size: number): string {
  const start = svg.indexOf('<svg');
  if (start === -1) return svg;
  const end = svg.indexOf('>', start);
  if (end === -1) return svg;

  let tag = svg.slice(start, end + 1);
  const selfClosing = tag.endsWith('/>');
  tag = tag.replace(/\s(?:width|height)\s*=\s*("[^"]*"|'[^']*')/g, '');
  tag = tag.slice(0, selfClosing ? -2 : -1) + ` width="${size}" height="${size}"` + (selfClosing ? '/>' : '>');

  return svg.slice(0, start) + tag + svg.slice(end + 1);
}

/**
 * Overlays a colored dot in the bottom-right corner of an SVG — like
 * editor tab badges — without altering the artwork itself. Works with any
 * SVG regardless of how it's colored (no `currentColor` required); the
 * original just needs a `viewBox` so it scales into the badge canvas.
 */
export function badgeSvg(svg: string, color: string): string {
  const inner = forceRootSize(svg, BADGE_CANVAS);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BADGE_CANVAS} ${BADGE_CANVAS}">` +
    inner +
    `<circle cx="76" cy="76" r="22" fill="${color}"/>` +
    `</svg>`
  );
}

/**
 * Encodes an SVG string as a `data:image/svg+xml,...` URI suitable for a
 * `<link rel="icon">` href, without base64 bloat.
 */
export function svgToDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
    .replace(/%20/g, ' ');
  return `data:image/svg+xml,${encoded}`;
}
