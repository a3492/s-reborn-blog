import { ACADEMY_SECTIONS, COURSE_LIST_HREF, TOPICS, topicHref } from './taxonomy';

/** Doctor AI Academy lives on its own Pages project. */
export const ACADEMY_URL = 'https://s-reborn-doctor-ai-academy.pages.dev/';

/** Official clinic homepage. Separate from this portal. */
export const CLINIC_URL = 'https://www.s-reborn.com/';
export const AI_ACADEMY_DESCRIPTION = '여러 분야에서 쓰는 AI를 기초부터 배우고 직접 실습합니다.';
export const DOCTOR_AI_ACADEMY_DESCRIPTION = '의료인을 위한 AI 병원 경영·연구·학술 교육입니다.';

export { COURSE_LIST_HREF };

export const COMING_SOON_HREF = '/coming-soon/';

export type NavChild = {
	id: string;
	label: string;
	labelEn: string;
	href: string;
	external?: boolean;
	description?: string;
	descriptionEn?: string;
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
		href: '/clinic/',
		children: [],
	},
	{
		id: 'clinic-website',
		label: '의원 홈페이지',
		labelEn: 'Clinic website',
		href: CLINIC_URL,
		external: true,
		children: [],
	},
	{
		id: 'research',
		label: 'AI LAB',
		labelEn: 'AI LAB',
		href: '/blog/',
		children: TOPICS.map(({ id, label, labelEn }) => ({
			id: `topic-${id}`, label, labelEn, href: topicHref(id),
		})),
	},
	{
		id: 'lectures',
		label: 'AI ACADEMY',
		labelEn: 'AI ACADEMY',
		href: '/lecture-materials/',
		children: ACADEMY_SECTIONS.map(({ id, label, labelEn, href }) => ({ id, label, labelEn, href })),
	},
	{
		id: 'about',
		label: '소개',
		labelEn: 'About',
		children: [
			{ id: 'about-profile', label: '프로필', labelEn: 'Profile', href: '/about/' },
			{ id: 'about-philosophy', label: '철학', labelEn: 'Philosophy', href: '/about/#philosophy' },
			{ id: 'about-cv', label: '공개 약력', labelEn: 'Public CV', href: '/about/#cv' },
			{ id: 'about-lab', label: 'S-REBORN LAB', labelEn: 'S-REBORN LAB', href: '/lab/' },
			{
				id: 'about-academy', label: 'Doctor AI Academy', labelEn: 'Doctor AI Academy', href: ACADEMY_URL, external: true,
				description: DOCTOR_AI_ACADEMY_DESCRIPTION, descriptionEn: 'AI education in practice management and research for healthcare professionals.',
			},
		],
	},
];

if (SITE_NAV.filter(({ external }) => !external).length > 5) {
	throw new Error('Top menu is limited to 5 internal items');
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
	if (bare === '/blog/topics' || bare.startsWith('/blog/topics/')) return null;
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
	if (url.hash) return false;
	return url.search === '';
}
