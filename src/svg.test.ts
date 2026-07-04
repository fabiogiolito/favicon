import { describe, expect, it } from 'vitest';
import { recolorSvg, svgToDataUri } from './svg.js';

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
