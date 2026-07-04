'use client';

import { useEffect } from 'react';
import { detectFaviconEnv } from './env.js';
import { resolveFavicon, type FaviconConfig } from './config.js';

function applyFavicon(config: FaviconConfig): void {
  const { href, mimeType } = resolveFavicon(config, detectFaviconEnv());

  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
  if (mimeType) link.type = mimeType;
}

/**
 * Sets the document's favicon on mount based on the current environment.
 *
 * Define `config` outside the component (or memoize it) — it's an effect
 * dependency, so a new object literal on every render re-applies the
 * favicon every render.
 */
export function useFavicon(config: FaviconConfig): void {
  useEffect(() => {
    applyFavicon(config);
  }, [config]);
}

export interface FaviconProps {
  config: FaviconConfig;
}

/** Component form of {@link useFavicon}, for JSX-first codebases. Renders nothing. */
export function Favicon({ config }: FaviconProps): null {
  useFavicon(config);
  return null;
}
