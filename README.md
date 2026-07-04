# env-favicon

Show a different favicon in local development, preview/staging, and production — so you can tell your tabs apart at a glance. Reuses [Vercel's own environment convention](https://vercel.com/docs/environment-variables/system-environment-variables) (`VERCEL_ENV`), so it works out of the box on Vercel and is easy to configure anywhere else.

Three ways to define your favicons, from zero-config to fully custom:
- **One SVG on a colored background** *(zero config)* — your existing favicon untouched in production, inset on a colored rounded square in preview/development. Works with any SVG.
- **One SVG, recolored per environment** — draw it once with `fill="currentColor"`, pick a color per env.
- **A different file per environment** — point each env at its own PNG/ICO/SVG, via config or a `next.config.ts` rewrite.

Custom environments (staging, QA, …) are supported everywhere, matching Vercel's custom environments feature. Ships with a plain-JS core, a React hook/component, and Next.js helpers for both the App Router and Pages Router. Zero dependencies, tree-shakeable, and SVG favicons are inlined as data URIs — no extra network requests.

## Install

```sh
npm install env-favicon
```

`react` and `next` are optional peer dependencies — only needed if you use `env-favicon/react` or `env-favicon/next`.

## How the environment is detected

`detectFaviconEnv()` resolves to `"production"`, `"preview"`, `"development"`, or a custom environment name, in this order:

1. **`VERCEL_ENV`** / **`NEXT_PUBLIC_VERCEL_ENV`** — set automatically by Vercel, so zero config is needed there. Vercel custom environments (e.g. `staging`) pass through as-is.
2. **`FAVICON_ENV`** / **`NEXT_PUBLIC_FAVICON_ENV`** — a manual override for other hosts (Netlify, Render, self-managed staging, etc). Set it to `production` / `preview` / `development` or any custom name in that environment's config.
3. Falls back to `NODE_ENV === 'production' ? 'production' : 'development'`.

Use the `NEXT_PUBLIC_`-prefixed variable when the value needs to reach the browser (e.g. in a React hook); the bare variable is enough on the server (e.g. in Next.js metadata).

## Quick start: zero config

Hand it the SVG you already use and you're done — production shows it untouched; in previews it sits inset on an amber rounded-square background, in local development on a green one. The inset guarantees the environment color is unmissable even at 16px tab size:

```ts
// favicon.config.ts
import { createEnvFaviconConfig } from 'env-favicon';

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...your favicon...</svg>`;

export const faviconConfig = createEnvFaviconConfig(icon);
```

This works with any SVG — no special markup needed (just make sure it has a `viewBox`). Pass your own map to change colors or mark other environments:

```ts
export const faviconConfig = createEnvFaviconConfig(icon, {
  preview: '#f59e0b',
  staging: '#8b5cf6',
  development: '#22c55e',
});
```

## Quick start: one SVG, recolored per environment

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

`currentColor` in the SVG is swapped for the given color and encoded as a `data:image/svg+xml` URI — no build step or extra files required. The colors argument is optional (defaults: amber preview, green development, production as-is) and accepts custom environment names as keys.

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

Sources can also be mixed — e.g. SVG recoloring for two environments and an explicit file for the third — by using the object form directly:

```ts
import type { FaviconConfig } from 'env-favicon';

export const faviconConfig: FaviconConfig = {
  production: { type: 'svg', svg: icon, color: '#000' },
  preview: { type: 'svg', svg: icon, color: '#f59e0b' },
  development: { type: 'url', href: '/favicon-dev.ico' },
};
```

## Custom environments & fallbacks

Config keys aren't limited to the standard three — any environment name works:

```ts
export const faviconConfig: FaviconConfig = {
  production: '/favicon.png',
  preview: '/favicon-preview.png',
  staging: '/favicon-staging.png',
};
```

The detected environment is matched against these keys. [Vercel custom environments](https://vercel.com/docs/deployments/environments#custom-environments) set `VERCEL_ENV` to the custom name automatically; anywhere else, set `FAVICON_ENV=staging` (or `NEXT_PUBLIC_FAVICON_ENV` for the browser).

Fallback order when an environment has no entry: the environment's own key → `preview` (for any non-production environment, so an unconfigured staging or QA deploy is still visually marked as "not production") → `production`.

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

## Next.js — rewrites (no components at all)

If you keep per-environment favicon **files** in `public/`, you can skip the component/metadata layer entirely and rewrite the standard favicon URL in `next.config.ts`. Rewrites resolve on the server, so this needs no `NEXT_PUBLIC_` vars and also covers browsers' automatic `/favicon.ico` requests:

```ts
// next.config.ts
import { faviconRewrites } from 'env-favicon';

export default {
  async rewrites() {
    return {
      beforeFiles: faviconRewrites({
        preview: '/favicon.preview.ico',
        development: '/favicon.development.ico',
      }),
    };
  },
};
```

In production this returns no rewrites, so your real `/favicon.ico` is served untouched. The helper returns plain `{ source, destination }` objects, so it works with any host or framework that accepts rewrite rules.

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
| `detectFaviconEnv()` | `env-favicon` | Returns `"production"`, `"preview"`, `"development"`, or a custom environment name. |
| `resolveFavicon(config, env)` | `env-favicon` | Resolves a `FaviconConfig` + env into `{ href, mimeType }`. |
| `createEnvFaviconConfig(svg, colors?)` | `env-favicon` | Zero-config: insets any SVG on a colored background per environment. |
| `createColorFaviconConfig(svg, colors?)` | `env-favicon` | Builds a `FaviconConfig` that recolors one `currentColor` SVG per environment. |
| `faviconRewrites(files, options?)` | `env-favicon` | Builds `next.config.ts` rewrite rules serving a per-env file at `/favicon.ico`. |
| `DEFAULT_ENV_COLORS` | `env-favicon` | The default color map: amber `preview`, green `development`. |
| `backgroundSvg(svg, color)` | `env-favicon` | Insets an SVG string on a colored rounded-square background. |
| `recolorSvg(svg, color)` | `env-favicon` | Replaces `currentColor` in an SVG string with a literal color. |
| `svgToDataUri(svg)` | `env-favicon` | Encodes an SVG string as a `data:image/svg+xml` URI. |
| `useFavicon(config, options?)` | `env-favicon/react` | Hook that sets `document.head`'s favicon link. `options.env` forces an environment. |
| `<Favicon config={config} env? />` | `env-favicon/react` | Component form of `useFavicon`. Renders nothing. |
| `getFaviconMetadata(config, env?)` | `env-favicon/next` | Builds the `icons` field for App Router `generateMetadata`/`metadata`. |
| `<FaviconHead config={config} env? />` | `env-favicon/next` | Pages Router component that injects the favicon `<link>` via `next/head`. |

## License

MIT
