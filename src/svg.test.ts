import { describe, expect, it } from 'vitest';
import { backgroundSvg, recolorSvg, svgToDataUri } from './svg.js';

describe('recolorSvg', () => {
  it('replaces every currentColor occurrence with the given color', () => {
    const svg = '<svg><circle fill="currentColor" stroke="currentColor" /></svg>';
    expect(recolorSvg(svg, '#ff0000')).toBe(
      '<svg><circle fill="#ff0000" stroke="#ff0000" /></svg>',
    );
  });

  it('leaves the svg untouched when there is nothing to replace', () => {
    const svg = '<svg><circle fill="blue" /></svg>';
    expect(recolorSvg(svg, '#ff0000')).toBe(svg);
  });
});

describe('backgroundSvg', () => {
  it('places the inset icon on a colored rounded rect', () => {
    const result = backgroundSvg('<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>', '#f59e0b');
    expect(result).toContain('viewBox="0 0 100 100"');
    expect(result).toContain('<rect width="100" height="100" rx="22" fill="#f59e0b"/>');
    expect(result).toContain('x="18" y="18" width="64" height="64"');
    expect(result).toContain('<path d="M0 0h24v24H0z"/>');
  });

  it('replaces existing root width/height so the icon scales into the canvas', () => {
    const result = backgroundSvg('<svg width="512" height="512" viewBox="0 0 24 24"><g/></svg>', 'red');
    expect(result).not.toContain('512');
    expect(result).toContain('<svg viewBox="0 0 24 24" x="18" y="18" width="64" height="64">');
  });

  it('preserves the artwork colors instead of recoloring them', () => {
    const result = backgroundSvg('<svg viewBox="0 0 24 24"><circle fill="blue"/></svg>', 'red');
    expect(result).toContain('fill="blue"');
  });
});

describe('svgToDataUri', () => {
  it('produces a data URI with the svg mime type', () => {
    const uri = svgToDataUri('<svg></svg>');
    expect(uri.startsWith('data:image/svg+xml,')).toBe(true);
  });

  it('encodes quotes so the result is safe inside an href attribute', () => {
    const uri = svgToDataUri('<svg fill="red"></svg>');
    expect(uri).not.toContain('"');
  });
});
