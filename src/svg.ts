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

const CANVAS = 100;

/**
 * Rewrites the root `<svg>` tag to render at a fixed position and size so it
 * can be nested inside a wrapper canvas. Only the root tag is touched; any
 * existing width/height attributes are dropped (the SVG's viewBox handles
 * scaling).
 */
function forceRootBox(svg: string, size: number, x = 0, y = 0): string {
  const start = svg.indexOf('<svg');
  if (start === -1) return svg;
  const end = svg.indexOf('>', start);
  if (end === -1) return svg;

  let tag = svg.slice(start, end + 1);
  const selfClosing = tag.endsWith('/>');
  tag = tag.replace(/\s(?:width|height|x|y)\s*=\s*("[^"]*"|'[^']*')/g, '');
  const box = ` x="${x}" y="${y}" width="${size}" height="${size}"`;
  tag = tag.slice(0, selfClosing ? -2 : -1) + box + (selfClosing ? '/>' : '>');

  return svg.slice(0, start) + tag + svg.slice(end + 1);
}

/**
 * Places the icon (inset to 64%) on a colored rounded-square background,
 * app-icon style. The artwork itself is untouched — the inset guarantees
 * the environment color stays visible around it, even at 16px tab size.
 * Works with any SVG that has a `viewBox`.
 */
export function backgroundSvg(svg: string, color: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}">` +
    `<rect width="${CANVAS}" height="${CANVAS}" rx="22" fill="${color}"/>` +
    forceRootBox(svg, 64, 18, 18) +
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
