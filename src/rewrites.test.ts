import { afterEach, describe, expect, it } from 'vitest';
import { faviconRewrites } from './rewrites.js';

const ENV_KEYS = ['VERCEL_ENV', 'NEXT_PUBLIC_VERCEL_ENV', 'FAVICON_ENV', 'NEXT_PUBLIC_FAVICON_ENV', 'NODE_ENV'] as const;
const originalValues = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalValues[key] === undefined) delete process.env[key];
    else process.env[key] = originalValues[key];
  }
});

function setEnv(env: string): void {
  for (const key of ENV_KEYS) delete process.env[key];
  process.env.VERCEL_ENV = env;
}

const FILES = {
  preview: '/favicon.preview.ico',
  development: '/favicon.development.ico',
};

describe('faviconRewrites', () => {
  it('returns no rewrites in production', () => {
    setEnv('production');
    expect(faviconRewrites(FILES)).toEqual([]);
  });

  it('rewrites /favicon.ico to the environment file', () => {
    setEnv('preview');
    expect(faviconRewrites(FILES)).toEqual([
      { source: '/favicon.ico', destination: '/favicon.preview.ico' },
    ]);
  });

  it('falls back to the preview file for custom environments', () => {
    setEnv('staging');
    expect(faviconRewrites(FILES)).toEqual([
      { source: '/favicon.ico', destination: '/favicon.preview.ico' },
    ]);
  });

  it('supports a custom source path', () => {
    setEnv('development');
    expect(faviconRewrites(FILES, { source: '/icon.svg' })).toEqual([
      { source: '/icon.svg', destination: '/favicon.development.ico' },
    ]);
  });

  it('returns no rewrites when the destination equals the source', () => {
    setEnv('preview');
    expect(faviconRewrites({ preview: '/favicon.ico' })).toEqual([]);
  });
});
