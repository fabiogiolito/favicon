export { detectFaviconEnv } from './env.js';
export type { FaviconEnv } from './env.js';

export { backgroundSvg, recolorSvg, svgToDataUri } from './svg.js';

export {
  resolveFavicon,
  createEnvFaviconConfig,
  createColorFaviconConfig,
  DEFAULT_ENV_COLORS,
} from './config.js';
export type {
  FaviconConfig,
  FaviconSource,
  SvgFaviconSource,
  UrlFaviconSource,
  ResolvedFavicon,
} from './config.js';

export { faviconRewrites } from './rewrites.js';
export type { FaviconRewrite } from './rewrites.js';
