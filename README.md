# env-favicon

Show a different favicon in local development, preview/staging, and production — so you can tell your tabs apart at a glance. Reuses [Vercel's own environment convention](https://vercel.com/docs/environment-variables/system-environment-variables) (`VERCEL_ENV`), so it works out of the box on Vercel and is easy to configure anywhere else.

Two ways to define your favicons:
- **One SVG, recolored per environment** — draw it once with `fill="currentColor"`, pick a color per env.
- **A different file per environment** — point each env at its own PNG/ICO/SVG.

Ships with plain-JS core, a React hook/component, and Next.js helpers for both the App Router and Pages Router.

## Install

```sh
npm install env-favicon
```

`react` and `next` are optional peer dependencies — only needed if you use `env-favicon/react` or `env-favicon/next`.

## How the environment is detected

`detectFaviconEnv()` resolves to `"production"`, `"preview"`, or `"development"`, in this order:

1. **`VERCEL_ENV`** / **`NEXT_PUBLIC_VERCEL_ENV`** — set automatically by Vercel, so zero config is needed there.
2. **`FAVICON_ENV`** / **`NEXT_PUBLIC_FAVICON_ENV`** — a manual override for other hosts (Netlify, Render, self-managed staging, etc). Set it to `production` / `preview` / `development` in that environment's config.
3. Falls back to `NODE_ENV === 'production' ? 'production' : 'development'`.

Use the `NEXT_PUBLIC_`-prefixed variable when the value needs to reach the browser (e.g. in a React hook); the bare variable is enough on the server (e.g. in Next.js metadata).

## Quick start: one SVG, three colors

```ts
// favicon.config.ts
import { createColorFaviconConfig } from 'env-favicon';

const icon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
`;

export const faviconConfig = createColorFaviconConfig(icon, {
  production: '#000000',
  preview: '#f59e0b', // amber
  development: '#22c55e', // green
});
```

`currentColor` in the SVG is swapped for the given color and encoded as a `data:image/svg+xml` URI — no build step or extra files required.

## Quick start: a different file per environment

```ts
// favicon.config.ts
import type { FaviconConfig } from 'env-favicon';

export const faviconConfig: FaviconConfig = {
  production: '/favicon.png',
  preview: '/favicon-preview.png',
  development: '/favicon-dev.png',
};
```

Any environment you omit falls back to `production`. Sources can also be mixed — e.g. SVG recoloring for two environments and an explicit file for the third — by using the object form directly:

```ts
import type { FaviconConfig } from 'env-favicon';

export const faviconConfig: FaviconConfig = {
  production: { type: 'svg', svg: icon, color: '#000' },
  preview: { type: 'svg', svg: icon, color: '#f59e0b' },
  development: { type: 'url', href: '/favicon-dev.ico' },
};
```

## Next.js — App Router

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { getFaviconMetadata } from 'env-favicon/next';
import { faviconConfig } from '../favicon.config';

export const metadata: Metadata = {
  icons: getFaviconMetadata(faviconConfig),
};
```

`getFaviconMetadata` runs on the server, so it reads `VERCEL_ENV`/`FAVICON_ENV` directly — no `NEXT_PUBLIC_` prefix needed.

## Next.js — Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { FaviconHead } from 'env-favicon/next';
import { faviconConfig } from '../favicon.config';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <FaviconHead config={faviconConfig} />
      <Component {...pageProps} />
    </>
  );
}
```

## React (no Next.js)

```tsx
import { useFavicon } from 'env-favicon/react';
import { faviconConfig } from './favicon.config';

function App() {
  useFavicon(faviconConfig);
  return <YourApp />;
}
```

Or, as a component:

```tsx
import { Favicon } from 'env-favicon/react';
import { faviconConfig } from './favicon.config';

function App() {
  return (
    <>
      <Favicon config={faviconConfig} />
      <YourApp />
    </>
  );
}
```

Auto-detection in the browser relies on your bundler inlining the env var at build time. Next.js does this for `NEXT_PUBLIC_*` variables, and on Vercel `NEXT_PUBLIC_VERCEL_ENV` is exposed automatically — so Next.js apps need zero config. Other bundlers don't inline `NEXT_PUBLIC_*` by default (Vite inlines `VITE_*` on `import.meta.env`, CRA inlines `REACT_APP_*`), so either map the variable through your bundler's `define` config, or skip detection and pass the environment explicitly:

```tsx
// Vite example — derive the env yourself and pass it in:
useFavicon(faviconConfig, {
  env: import.meta.env.VITE_VERCEL_ENV ?? (import.meta.env.PROD ? 'production' : 'development'),
});
```

Every integration point (`useFavicon`, `<Favicon />`, `getFaviconMetadata`, `<FaviconHead />`) accepts this optional `env` override.

## API

| Export | From | Description |
| --- | --- | --- |
| `detectFaviconEnv()` | `env-favicon` | Returns `"production" \| "preview" \| "development"` for the current environment. |
| `resolveFavicon(config, env)` | `env-favicon` | Resolves a `FaviconConfig` + env into `{ href, mimeType }`. |
| `createColorFaviconConfig(svg, colors)` | `env-favicon` | Builds a `FaviconConfig` that recolors one SVG per environment. |
| `recolorSvg(svg, color)` | `env-favicon` | Replaces `currentColor` in an SVG string with a literal color. |
| `svgToDataUri(svg)` | `env-favicon` | Encodes an SVG string as a `data:image/svg+xml` URI. |
| `useFavicon(config, options?)` | `env-favicon/react` | Hook that sets `document.head`'s favicon link. `options.env` forces an environment. |
| `<Favicon config={config} env? />` | `env-favicon/react` | Component form of `useFavicon`. Renders nothing. |
| `getFaviconMetadata(config, env?)` | `env-favicon/next` | Builds the `icons` field for App Router `generateMetadata`/`metadata`. |
| `<FaviconHead config={config} env? />` | `env-favicon/next` | Pages Router component that injects the favicon `<link>` via `next/head`. |

## License

MIT
