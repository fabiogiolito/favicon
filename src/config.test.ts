import { describe, expect, it } from 'vitest';
import { createColorFaviconConfig, resolveFavicon } from './config.js';

const SVG = '<svg><path fill="currentColor" d="M0 0h10v10H0z" /></svg>';

describe('resolveFavicon', () => {
  it('resolves a plain string source and guesses its mime type', () => {
    const resolved = resolveFavicon({ production: '/favicon-prod.png' }, 'production');
    expect(resolved).toEqual({ href: '/favicon-prod.png', mimeType: 'image/png' });
  });

  it('recolors an svg source into a data uri', () => {
    const resolved = resolveFavicon(
      { production: { type: 'svg', svg: SVG, color: '#000' } },
      'production',
    );
    expect(resolved.mimeType).toBe('image/svg+xml');
    expect(resolved.href).toContain('data:image/svg+xml,');
  });

  it('falls back to production when the requested env has no source', () => {
    const resolved = resolveFavicon({ production: '/prod.png' }, 'preview');
    expect(resolved.href).toBe('/prod.png');
  });

  it('prefers an explicit env-specific source over the production fallback', () => {
    const resolved = resolveFavicon(
      { production: '/prod.png', preview: '/preview.png' },
      'preview',
    );
    expect(resolved.href).toBe('/preview.png');
  });

  it('respects an explicit mimeType on url sources', () => {
    const resolved = resolveFavicon(
      { production: { type: 'url', href: '/icon', mimeType: 'image/png' } },
      'production',
    );
    expect(resolved.mimeType).toBe('image/png');
  });
});

describe('createColorFaviconConfig', () => {
  it('builds one svg source per provided color', () => {
    const config = createColorFaviconConfig(SVG, {
      production: 'red',
      preview: 'orange',
      development: 'green',
    });

    expect(resolveFavicon(config, 'production').href).toContain('red');
    expect(resolveFavicon(config, 'preview').href).toContain('orange');
    expect(resolveFavicon(config, 'development').href).toContain('green');
  });

  it('omits environments whose color was not provided, so they fall back to production', () => {
    const config = createColorFaviconConfig(SVG, { production: 'red' });
    expect(config.preview).toBeUndefined();
    expect(resolveFavicon(config, 'preview').href).toContain('red');
  });
});
