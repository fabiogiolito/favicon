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
