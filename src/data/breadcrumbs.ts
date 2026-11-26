import { COURSE_LIST_HREF, SITE_NAV, localizeHref, normalizePath, toKoreanPath, type NavChild, type NavItem } from './site-nav';
import { ACADEMY_SECTIONS, cellOf, isTopic, type TaxonomyPost } from './taxonomy';

const ORIGIN = 'https://sreborn.net';

export type CrumbLink = { id: string; label: string; href: string; external?: boolean };
type CrumbSection = { id: string; childId: string };
export type CrumbModel = {
	items: CrumbLink[];
	siblings: CrumbLink[];
	sectionId: string;
	currentId: string;
	defaultId: string;
	sections: CrumbSection[];
	watch: boolean;
	hideDefault: boolean;
};

const HASH_PAGES: Record<string, { defaultId: string; sections: CrumbSection[] }> = {
	'/lecture-materials/': {
		defaultId: 'lectures-home',
		sections: [
			{ id: 'practice', childId: 'lectures-practice' },
			{ id: 'materials', childId: 'lectures-files' },
			{ id: 'talks', childId: 'lectures-record' },
		],
	},
	'/about/': {
		defaultId: 'about-profile',
		sections: [
			{ id: 'philosophy', childId: 'about-philosophy' },
			{ id: 'cv', childId: 'about-cv' },
		],
	},
};

// Specific archive paths precede the event path.
const LECTURE_PREFIXES = [
	['/lecture-materials/2026-11-08/archive/', 'lectures-files'],
	['/lecture-materials/archive/', 'lectures-files'],
	['/lecture-materials/', 'lectures-record'],
	['/lectures/', 'lectures-record'],
	['/presentation/', 'lectures-record'],
	['/tutorials/', 'lectures-practice'],
	['/tools/', 'lectures-files'],
] as const;

function navItem(id: string): NavItem {
	const item = SITE_NAV.find((entry) => entry.id === id);
	if (!item) throw new Error(`Missing nav item ${id}`);
	return item;
}

function linkOf(item: NavItem | NavChild, isEn: boolean): CrumbLink {
	const href = item.href || '/about/';
	return {
		id: item.id,
		label: isEn ? item.labelEn : item.label,
		href: item.external ? href : localizeHref(href, isEn),
		external: item.external,
	};
}

export function absoluteCrumbHref(href: string): string {
	return new URL(href, ORIGIN).href;
}

export function buildCrumbs(
	pathname: string, hash: string, isEn: boolean,
	pageTitle?: string, post?: TaxonomyPost,
): CrumbModel | null {
	const path = normalizePath(toKoreanPath(pathname));
	const watched = HASH_PAGES[path];
	const topic = /^\/blog\/topics\/([^/]+)\/$/.exec(path)?.[1];
	const cell = post ? cellOf(post) : topic;
	const academy = path === COURSE_LIST_HREF ? 'lectures-course' : ACADEMY_SECTIONS.find((section) => section.cell === cell)?.id;
	const lecture = LECTURE_PREFIXES.find(([prefix]) => path.startsWith(prefix));
	let sectionId: string;
	let childId: string | undefined;

	if (path.startsWith('/clinic/')) {
		sectionId = 'clinic';
	} else if (path === '/lab/' || path.startsWith('/lab/') || path.startsWith('/about/')) {
		sectionId = 'about';
		childId = path.startsWith('/lab/') ? 'about-lab' : 'about-profile';
	} else if (academy || lecture) {
		sectionId = 'lectures';
		childId = academy ?? lecture?.[1];
	} else if (path.startsWith('/technology/')) {
		sectionId = 'research';
		childId = 'technology';
	} else if (path.startsWith('/blog/')) {
		sectionId = 'research';
		if (isTopic(cell)) childId = `topic-${cell}`;
	} else {
		return null;
	}

	const section = navItem(sectionId);
	const pillar = linkOf(section, isEn);
	const hideDefault = watched?.defaultId === 'lectures-home';
	const selectedId = watched
		? watched.sections.find((entry) => `#${entry.id}` === hash)?.childId ?? watched.defaultId
		: childId;
	const siblings = section.children.filter(({ pending }) => !pending).map((child) => linkOf(child, isEn));
	const child = siblings.find((item) => item.id === selectedId);
	const items = [linkOf(navItem('home'), isEn), pillar];
	if (child) items.push(child);
	else if (hideDefault) items.push({ ...pillar, id: 'lectures-home' });

	const childPath = child && normalizePath(toKoreanPath(new URL(child.href, ORIGIN).pathname));
	if (pageTitle && (post || (lecture && !watched && childPath !== path))) {
		items.push({ id: 'current-page', label: pageTitle, href: normalizePath(pathname) });
	}

	return {
		items, siblings, sectionId,
		currentId: selectedId ?? sectionId,
		defaultId: watched?.defaultId ?? selectedId ?? sectionId,
		sections: watched?.sections ?? [], watch: Boolean(watched), hideDefault,
	};
}
