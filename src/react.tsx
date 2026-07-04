'use client';

import { useEffect } from 'react';
import { detectFaviconEnv, type FaviconEnv } from './env.js';
import { resolveFavicon, type FaviconConfig } from './config.js';

export interface UseFaviconOptions {
  /**
   * Force a specific environment instead of auto-detecting from env vars.
   * Useful in bundlers that don't expose `process.env` to the browser
   * (e.g. Vite: pass a value derived from `import.meta.env`).
   */
  env?: FaviconEnv;
}

/**
 * Sets the document's favicon based on the current environment. The effect
 * is keyed on the resolved favicon URL, so passing a fresh `config` object
 * each render is fine — the DOM is only touched when the result changes.
 */
export function useFavicon(config: FaviconConfig, options?: UseFaviconOptions): void {
  const { href, mimeType } = resolveFavicon(config, options?.env ?? detectFaviconEnv());

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
    if (mimeType) link.type = mimeType;
    else link.removeAttribute('type');
  }, [href, mimeType]);
}

export interface FaviconProps {
  config: FaviconConfig;
  /** Force a specific environment instead of auto-detecting. */
  env?: FaviconEnv;
}

/** Component form of {@link useFavicon}, for JSX-first codebases. Renders nothing. */
export function Favicon({ config, env }: FaviconProps): null {
  useFavicon(config, env ? { env } : undefined);
  return null;
}
