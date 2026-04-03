import raw from './site-brand.json';

export type SiteBrand = typeof raw;

/**
 * 표시용 브랜드 단일 소스.
 * - Astro: `import { SITE_BRAND, SITE_TITLE } from '../consts'` (SITE_TITLE === blogDisplayName)
 * - 정적 HTML·dai-nav: `npm run sync:site-brand` (빌드 전 prebuild에서 자동 실행)
 * - 런타임 덮어쓰기(선택): `window.__SREBORN_SITE_BRAND__ = { ...same keys }` 후 dai-nav 로드
 */
export const SITE_BRAND: SiteBrand = raw;
