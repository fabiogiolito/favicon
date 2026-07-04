export { detectFaviconEnv } from './env.js';
export type { FaviconEnv } from './env.js';

export { badgeSvg, recolorSvg, svgToDataUri } from './svg.js';

export {
  resolveFavicon,
  createBadgeFaviconConfig,
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
