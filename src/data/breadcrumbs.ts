import {
	SITE_NAV,
	localizeHref,
	normalizePath,
	toKoreanPath,
	type NavChild,
	type NavItem,
} from './site-nav';

const ORIGIN = 'https://sreborn.net';

export type CrumbLink = {
	id: string;
	label: string;
	href: string;
	external?: boolean;
};

export type CrumbSection = {
	id: string;
	childId: string;
};

export type CrumbModel = {
	items: CrumbLink[];
	siblings: CrumbLink[];
	currentId: string;
	defaultId: string;
	watch: boolean;
	sections: CrumbSection[];
};

const HASH_PAGES: Record<string, { defaultId: string; sections: CrumbSection[] }> = {
	'/lecture-materials/': {
		defaultId: 'lectures-home',
		sections: [
			{ id: 'materials', childId: 'lectures-files' },
			{ id: 'practice', childId: 'lectures-practice' },
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

/** Longer prefixes first. These pages sit inside a menu child, not a third menu level. */
const LECTURE_PREFIXES: { prefix: string; childId: string }[] = [
	{ prefix: '/lecture-materials/2026-11-08/archive/', childId: 'lectures-files' },
	{ prefix: '/lecture-materials/archive/', childId: 'lectures-files' },
	{ prefix: '/lecture-materials/kang-sehee/', childId: 'lectures-record' },
	{ prefix: '/lecture-materials/kim-dowi/', childId: 'lectures-record' },
	{ prefix: '/lecture-materials/2026-11-08/', childId: 'lectures-record' },
	{ prefix: '/lectures/', childId: 'lectures-record' },
	{ prefix: '/tutorials/', childId: 'lectures-practice' },
	{ prefix: '/tools/', childId: 'lectures-files' },
];

const SECTION_HREF: Record<string, string> = {
	lectures: '/lecture-materials/',
	about: '/about/',
	research: '/blog/',
};

function koreanPath(pathname: string): string {
	return normalizePath(toKoreanPath(pathname));
}

function navItem(id: string): NavItem {
	const item = SITE_NAV.find((entry) => entry.id === id);
	if (!item) throw new Error(`Missing nav item ${id}`);
	return item;
}

function childById(section: NavItem, id: string): NavChild {
	const child = section.children.find((entry) => entry.id === id);
	if (!child) throw new Error(`Missing nav child ${id}`);
	return child;
}

function sectionFor(path: string): NavItem | null {
	if (path === '/blog/' || path.startsWith('/blog/') || path === '/lab/' || path.startsWith('/lab/')) return navItem('research');
	if (path === '/about/' || path.startsWith('/about/')) return navItem('about');
	if (
		path === '/lecture-materials/' || path.startsWith('/lecture-materials/') ||
		path === '/lectures/' || path.startsWith('/lectures/') ||
		path === '/tutorials/' || path.startsWith('/tutorials/') ||
		path === '/tools/' || path.startsWith('/tools/')
	) return navItem('lectures');
	return null;
}

function childFor(section: NavItem, path: string, hash: string): NavChild {
	const watched = HASH_PAGES[path];
	if (watched && section.id !== 'research') {
		const match = watched.sections.find((sectionItem) => `#${sectionItem.id}` === hash);
		return childById(section, match?.childId ?? watched.defaultId);
	}
	if (section.id === 'lectures') {
		const prefix = LECTURE_PREFIXES.find((entry) => path.startsWith(entry.prefix));
		if (prefix) return childById(section, prefix.childId);
		return childById(section, 'lectures-home');
	}
	if (section.id === 'research') {
		if (path.startsWith('/lab/')) return childById(section, 'research-lab');
		return childById(section, 'research-all');
	}
	return section.children[0];
}

function linkOf(id: string, label: string, href: string, isEn: boolean, external = false): CrumbLink {
	return {
		id,
		label,
		href: external ? href : localizeHref(href, isEn),
		external,
	};
}

export function absoluteCrumbHref(href: string): string {
	return new URL(href, ORIGIN).href;
}

export function buildCrumbs(pathname: string, hash: string, isEn: boolean): CrumbModel | null {
	const path = koreanPath(pathname);
	if (path === '/') return null;
	const section = sectionFor(path);
	if (!section) return null;
	const sectionHref = SECTION_HREF[section.id];
	if (!sectionHref) return null;
	const child = childFor(section, path, hash);
	const home = navItem('home');
	const watched = HASH_PAGES[path];
	const items = [
		linkOf('home', isEn ? home.labelEn : home.label, home.href || '/', isEn),
		linkOf(section.id, isEn ? section.labelEn : section.label, sectionHref, isEn),
		linkOf(child.id, isEn ? child.labelEn : child.label, child.href, isEn, Boolean(child.external)),
	];
	const siblings = section.children
		.filter((entry) => !entry.pending)
		.map((entry) => linkOf(entry.id, isEn ? entry.labelEn : entry.label, entry.href, isEn, Boolean(entry.external)));
	return {
		items,
		siblings,
		currentId: child.id,
		defaultId: watched?.defaultId ?? child.id,
		watch: Boolean(watched),
		sections: watched?.sections ?? [],
	};
}
