/** 예전 아카데미 사이트. 메뉴는 /academy/ 를 쓰고, 이 주소는 기존 외부 리다이렉트용으로 남긴다. */
export const ACADEMY_URL = 'https://s-reborn-doctor-ai-academy.pages.dev/';

/** Official clinic homepage. Separate from this portal. */
export const CLINIC_URL = 'https://www.s-reborn.com/';

export const COMING_SOON_HREF = '/coming-soon/';

export type NavChild = {
	id: string;
	label: string;
	labelEn: string;
	href: string;
	external?: boolean;
	/** No public page yet. Label renders as 준비중 and href is the shared placeholder. */
	pending?: boolean;
	group?: string;
	groupEn?: string;
};

export type NavItem = {
	id: string;
	label: string;
	labelEn: string;
	href?: string;
	external?: boolean;
	children: NavChild[];
};

export const SITE_NAV: NavItem[] = [
	{
		id: 'home',
		label: '홈',
		labelEn: 'Home',
		href: '/',
		children: [],
	},
	{
		id: 'clinic',
		label: '클리닉',
		labelEn: 'Clinic',
		href: CLINIC_URL,
		external: true,
		children: [],
	},
	{
		id: 'research',
		label: 'AI 연구·글',
		labelEn: 'Research & writing',
		children: [
			{ id: 'research-all', label: '전체 글', labelEn: 'All posts', href: '/blog/' },
			{ id: 'research-lab', label: 'S-REBORN LAB', labelEn: 'S-REBORN LAB', href: '/lab/' },
		],
	},
	{
		id: 'lectures',
		label: '강연·자료',
		labelEn: 'Talks & materials',
		children: [
			{ id: 'lectures-home', label: '강연·자료 홈', labelEn: 'Lecture home', href: '/lecture-materials/' },
			{ id: 'lectures-files', label: '강연 자료', labelEn: 'Lecture files', href: '/lecture-materials/archive/' },
			{ id: 'lectures-practice', label: '따라하는 실습', labelEn: 'Guided practice', href: '/tutorials/' },
			{ id: 'lectures-record', label: '발표·기록', labelEn: 'Talks and notes', href: '/lectures/' },
		],
	},
	{
		id: 'about',
		label: '소개',
		labelEn: 'About',
		children: [
			{ id: 'about-profile', label: '프로필', labelEn: 'Profile', href: '/about/' },
			{ id: 'about-philosophy', label: '철학', labelEn: 'Philosophy', href: '/about/#philosophy' },
			{ id: 'about-cv', label: '공개 약력', labelEn: 'Public CV', href: '/about/#cv' },
			{ id: 'about-academy', label: '의료 AI 강의', labelEn: '의료 AI 강의', href: '/academy/' },
			{ id: 'about-clinic', label: '클리닉 사이트', labelEn: 'Clinic site', href: CLINIC_URL, external: true },
		],
	},
];

if (SITE_NAV.length > 5) {
	throw new Error(`Top menu is limited to 5 items (got ${SITE_NAV.length})`);
}

export function normalizePath(pathname: string): string {
	if (pathname === '' || pathname === '/') return '/';
	return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

/** Korean path for a URL. English blog paths drop the /en prefix. */
export function toKoreanPath(pathname: string): string {
	if (pathname === '/en' || pathname === '/en/') return '/';
	if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
	return pathname;
}

/**
 * English twin of a Korean path.
 * Only /blog/ is published in English. Everything else returns null.
 */
export function toEnglishPath(pathname: string): string | null {
	const bare = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
	if (bare !== '/blog' && !bare.startsWith('/blog/')) return null;
	const suffix = pathname.slice('/blog'.length);
	const rest = suffix === '' ? '/' : suffix.startsWith('/') ? suffix : `/${suffix}`;
	const withSlash = rest.endsWith('/') ? rest : `${rest}/`;
	return `/en/blog${withSlash}`;
}

export function localizeHref(href: string, isEn: boolean): string {
	if (!isEn || href.startsWith('http') || href.startsWith(COMING_SOON_HREF)) return href;
	const url = new URL(href, 'https://sreborn.net');
	const english = toEnglishPath(url.pathname);
	if (!english) return href;
	return `${english}${url.search}${url.hash}`;
}

export function linkIsCurrent(href: string, url: URL): boolean {
	if (href.startsWith('http')) return false;
	const target = new URL(href, url.origin);
	if (normalizePath(target.pathname) !== normalizePath(url.pathname)) return false;
	if (target.search) return target.search === url.search;
	if (target.hash) return url.hash === target.hash;
	return url.search === '';
}

export function sectionIsCurrent(id: string, url: URL): boolean {
	const path = normalizePath(toKoreanPath(url.pathname));
	if (id === 'home') return path === '/';
	if (id === 'clinic') return false;
	if (id === 'research') return path === '/blog/' || path.startsWith('/blog/');
	if (id === 'lectures') return path === '/lecture-materials/' || path.startsWith('/lecture-materials/') || path === '/lectures/' || path.startsWith('/lectures/') || path === '/tools/' || path.startsWith('/tools/') || path === '/tutorials/' || path.startsWith('/tutorials/');
	if (id === 'about') return path === '/about/' || path.startsWith('/about/') || path === '/academy/' || path.startsWith('/academy/');
	return false;
}
