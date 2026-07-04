import { describe, expect, it } from 'vitest';
import {
  createBadgeFaviconConfig,
  createColorFaviconConfig,
  DEFAULT_ENV_COLORS,
  resolveFavicon,
} from './config.js';

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

  it('resolves custom environment names against matching config keys', () => {
    const resolved = resolveFavicon(
      { production: '/prod.png', staging: '/staging.png' },
      'staging',
    );
    expect(resolved.href).toBe('/staging.png');
  });

  it('falls back to preview for unconfigured non-production environments', () => {
    const config = { production: '/prod.png', preview: '/preview.png' };
    expect(resolveFavicon(config, 'staging').href).toBe('/preview.png');
    expect(resolveFavicon(config, 'development').href).toBe('/preview.png');
  });

  it('falls back to production when neither the env nor preview is configured', () => {
    expect(resolveFavicon({ production: '/prod.png' }, 'staging').href).toBe('/prod.png');
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

  it('applies default preview/development colors with no colors argument', () => {
    const config = createColorFaviconConfig(SVG);
    expect(resolveFavicon(config, 'preview').href).toContain(
      encodeURIComponent(DEFAULT_ENV_COLORS.preview),
    );
    expect(resolveFavicon(config, 'development').href).toContain(
      encodeURIComponent(DEFAULT_ENV_COLORS.development),
    );
    expect(resolveFavicon(config, 'production').href).toContain('currentColor');
  });

  it('supports custom environment names as color keys', () => {
    const config = createColorFaviconConfig(SVG, { production: 'red', staging: 'purple' });
    expect(resolveFavicon(config, 'staging').href).toContain('purple');
  });
});

describe('createBadgeFaviconConfig', () => {
  it('leaves production untouched and badges preview/development by default', () => {
    const config = createBadgeFaviconConfig(SVG);
    const production = resolveFavicon(config, 'production').href;
    const preview = resolveFavicon(config, 'preview').href;

    expect(production).toBe(resolveFavicon({ production: { type: 'svg', svg: SVG } }, 'production').href);
    expect(preview).toContain(encodeURIComponent('<circle'));
    expect(preview).toContain(encodeURIComponent(DEFAULT_ENV_COLORS.preview));
  });

  it('supports custom environments and colors', () => {
    const config = createBadgeFaviconConfig(SVG, { staging: '#8b5cf6' });
    expect(resolveFavicon(config, 'staging').href).toContain(encodeURIComponent('#8b5cf6'));
    // the custom map replaces the defaults, so preview has no entry and falls back to production
    expect(resolveFavicon(config, 'preview').href).not.toContain(encodeURIComponent('<circle'));
  });
});
