import { MENU_GROUPS } from '../consts';

/** Doctor AI Academy lives on its own Pages project. */
export const ACADEMY_URL = 'https://s-reborn-doctor-ai-academy.pages.dev/';

export const COMING_SOON_HREF = '/coming-soon/';

export type NavChild = {
	id: string;
	label: string;
	labelEn: string;
	href: string;
	external?: boolean;
	/** No public page yet. Label renders as 준비중 and href is the shared placeholder. */
	pending?: boolean;
};

export type NavItem = {
	id: string;
	label: string;
	labelEn: string;
	children: NavChild[];
};

const researchGroups: NavChild[] = MENU_GROUPS.map((group) => ({
	id: `research-${group.id}`,
	label: group.label,
	labelEn: group.labelEn,
	href: `/blog/?group=${group.id}`,
}));

export const SITE_NAV: NavItem[] = [
	{
		id: 'home',
		label: '홈',
		labelEn: 'Home',
		children: [
			{ id: 'home-top', label: '첫 화면', labelEn: 'Top', href: '/' },
			{ id: 'home-explore', label: '둘러보기', labelEn: 'Explore', href: '/#explore' },
			{ id: 'home-research', label: '현재 연구', labelEn: 'Current research', href: '/#research' },
			{ id: 'home-writing', label: '생각과 기록', labelEn: 'Selected writing', href: '/#writing' },
		],
	},
	{
		id: 'clinic',
		label: '클리닉',
		labelEn: 'Clinic',
		children: [
			{
				id: 'clinic-soon',
				label: '준비중',
				labelEn: '준비중',
				href: `${COMING_SOON_HREF}?from=clinic`,
				pending: true,
			},
		],
	},
	{
		id: 'research',
		label: 'AI 연구·글',
		labelEn: 'Research & writing',
		children: [
			{ id: 'research-all', label: '전체 글', labelEn: 'All posts', href: '/blog/' },
			...researchGroups,
			{
				id: 'research-academy',
				label: 'Doctor AI Academy',
				labelEn: 'Doctor AI Academy',
				href: ACADEMY_URL,
				external: true,
			},
		],
	},
	{
		id: 'lectures',
		label: '강연·자료',
		labelEn: 'Talks & materials',
		children: [
			{ id: 'lectures-index', label: '웹 강연', labelEn: 'Web lectures', href: '/lectures/' },
			{
				id: 'lectures-koat',
				label: 'KOAT 2026 강연',
				labelEn: 'KOAT 2026 lecture',
				href: '/lectures/koat-ai-2026/',
			},
			{
				id: 'lectures-daemire',
				label: '2026-11-08 대미레 자료',
				labelEn: '2026-11-08 Daemire materials',
				href: '/tools/lectures/2026-11-08-daemire/',
			},
			{
				id: 'lectures-pain',
				label: '병원 데이터 페인포인트',
				labelEn: 'Hospital data pain points',
				href: '/tools/hospital-data-pain-points/',
			},
			{
				id: 'lectures-consult',
				label: '상담 데이터',
				labelEn: 'Consult archive',
				href: '/tools/consult-archive/',
			},
			{
				id: 'lectures-procedure',
				label: '시술 기록',
				labelEn: 'Procedure archive',
				href: '/tools/procedure-archive/',
			},
			{ id: 'lectures-hub', label: '자료 허브', labelEn: 'Materials hub', href: '/tools/' },
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
	if (id === 'lectures') return path === '/lectures/' || path.startsWith('/lectures/') || path === '/tools/' || path.startsWith('/tools/');
	if (id === 'about') return path === '/about/' || path.startsWith('/about/');
	return false;
}
