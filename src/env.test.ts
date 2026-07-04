import { afterEach, describe, expect, it } from 'vitest';
import { detectFaviconEnv } from './env.js';

const ENV_KEYS = [
  'VERCEL_ENV',
  'NEXT_PUBLIC_VERCEL_ENV',
  'FAVICON_ENV',
  'NEXT_PUBLIC_FAVICON_ENV',
  'NODE_ENV',
] as const;

const originalValues = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalValues[key] === undefined) delete process.env[key];
    else process.env[key] = originalValues[key];
  }
});

function clearEnv(): void {
  for (const key of ENV_KEYS) delete process.env[key];
}

describe('detectFaviconEnv', () => {
  it('uses VERCEL_ENV when set', () => {
    clearEnv();
    process.env.VERCEL_ENV = 'preview';
    expect(detectFaviconEnv()).toBe('preview');
  });

  it('uses NEXT_PUBLIC_VERCEL_ENV as a client-side fallback', () => {
    clearEnv();
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
    expect(detectFaviconEnv()).toBe('production');
  });

  it('prefers VERCEL_ENV over a manual override', () => {
    clearEnv();
    process.env.VERCEL_ENV = 'production';
    process.env.FAVICON_ENV = 'development';
    expect(detectFaviconEnv()).toBe('production');
  });

  it('falls back to FAVICON_ENV when not on Vercel', () => {
    clearEnv();
    process.env.FAVICON_ENV = 'preview';
    expect(detectFaviconEnv()).toBe('preview');
  });

  it('falls back to NODE_ENV=production mapping to "production"', () => {
    clearEnv();
    process.env.NODE_ENV = 'production';
    expect(detectFaviconEnv()).toBe('production');
  });

  it('defaults to "development" when nothing is set', () => {
    clearEnv();
    expect(detectFaviconEnv()).toBe('development');
  });

  it('passes through Vercel custom environment names', () => {
    clearEnv();
    process.env.VERCEL_ENV = 'staging';
    expect(detectFaviconEnv()).toBe('staging');
  });

  it('passes through custom names from the override var', () => {
    clearEnv();
    process.env.FAVICON_ENV = 'qa';
    expect(detectFaviconEnv()).toBe('qa');
  });

  it('treats an empty string as unset', () => {
    clearEnv();
    process.env.VERCEL_ENV = '';
    process.env.NODE_ENV = 'production';
    expect(detectFaviconEnv()).toBe('production');
  });
});
