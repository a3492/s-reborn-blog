/**
 * Browser checks for home, shared navigation, themes and linked resources.
 * Serves dist/ unless QA_BASE_URL is set. Uses system Chrome when present.
 *
 *   npm run build && npm run qa:home-browser
 */
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const shots = process.env.QA_SHOTS;
const widths = [320, 360, 390, 768, 1280, 1440];
const themeCases = [
	['light', 'dark'],
	['dark', 'light'],
	['system', 'light'],
	['system', 'dark'],
];
const lectureHome = '/lecture-materials/';
const courseList = '/lecture-materials/courses/';
const lectureSlots = [
	{ id: 'lectures-course', label: '강의', href: courseList },
	{ id: 'lectures-practice', label: '실습', href: lectureHome + '#practice' },
	{ id: 'lectures-files', label: '자료', href: lectureHome + '#materials' },
	{ id: 'lectures-record', label: '발표·기록', href: lectureHome + '#talks' },
];
const topicSlots = [
	['basics', 'AI 이해', 82], ['prompting', '프롬프트·컨텍스트', 42],
	['building', '에이전트·개발', 71], ['clinic', '진료·업무', 41], ['research', '연구·학술', 34],
	['tools', '도구·리뷰', 73], ['society', 'AI와 사회', 51],
];
const articlePath = '/blog/aerini/what-is-ai/';

const failures = [];
function check(condition, message) {
	if (!condition) failures.push(message);
}

function chromePath() {
	const candidates = [process.env.CHROME_PATH, '/usr/local/bin/google-chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'];
	return candidates.find((candidate) => candidate && existsSync(candidate));
}

function contentType(file) {
	if (file.endsWith('.html')) return 'text/html; charset=utf-8';
	if (file.endsWith('.css')) return 'text/css; charset=utf-8';
	if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
	if (file.endsWith('.svg')) return 'image/svg+xml';
	if (file.endsWith('.json')) return 'application/json';
	if (file.endsWith('.webp')) return 'image/webp';
	if (file.endsWith('.png')) return 'image/png';
	return 'application/octet-stream';
}

function startStatic(directory) {
	return new Promise((resolve) => {
		const server = createServer(async (req, res) => {
			try {
				const url = new URL(req.url || '/', 'http://127.0.0.1');
				let file = decodeURIComponent(url.pathname);
				if (file.endsWith('/')) file += 'index.html';
				const full = path.join(directory, file);
				if (!full.startsWith(`${directory}${path.sep}`)) {
					res.writeHead(403);
					res.end();
					return;
				}
				const body = await readFile(full);
				res.writeHead(200, { 'content-type': contentType(full) });
				res.end(body);
			} catch {
				res.writeHead(404);
				res.end('not found');
			}
		});
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			resolve({ server, base: `http://127.0.0.1:${address.port}` });
		});
	});
}

function fontSize(locator) {
	return locator.evaluate((element) => getComputedStyle(element).fontSize);
}

async function openPage(page, url) {
	const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
	if (!response?.ok()) throw new Error(`Page did not load: ${url} (${response?.status()})`);
}

async function checkTheme(page, preference, scheme, name) {
	const state = await page.locator('html').evaluate((html) => ({
		selected: html.dataset.themePreference,
		rendered: html.dataset.theme,
	}));
	check(state.selected === preference && state.rendered === (preference === 'system' ? scheme : preference),
		`${name}: unexpected theme ${JSON.stringify(state)}`);
}

async function checkHome(page, width, name) {
	const posts = await page.locator('#latest .portal-row-post').evaluateAll((rows) => rows.map((row) => {
		const [title, meta] = row.children;
		const [category, separator, date] = meta?.children ?? [];
		return row.matches('a[href^="/blog/"]') &&
			row.children.length === 2 && [...row.childNodes].every((node) => node.nodeType !== 3 || !node.textContent.trim()) &&
			title?.matches('.portal-title') && Boolean(title.textContent.trim()) &&
			meta?.matches('.portal-meta') && meta.children.length === 3 &&
			Boolean(category?.textContent.trim()) && separator?.getAttribute('aria-hidden') === 'true' &&
			date?.matches('time[datetime]') && Boolean(date.textContent.trim());
	}));
	check(posts.length > 0 && posts.every(Boolean), `${name}: home rows must contain a linked title, category and date only`);
	check(await fontSize(page.locator('body')) === '16px', `${name}: home body must be 16px`);

	const chat = await page.locator('#openchat').evaluate((section) => {
		const button = section.querySelector('.openchat-button');
		const qr = section.querySelector('.openchat-qr');
		const image = qr?.querySelector('img[alt]');
		const target = image ? new URL(image.src).searchParams.get('data') : null;
		return {
			linked: Boolean(button?.href.startsWith('https://open.kakao.com/') && qr?.href === button.href && target === qr.href),
			stacked: qr?.getBoundingClientRect().top >= section.querySelector('.openchat-copy')?.getBoundingClientRect().bottom,
		};
	});
	check(chat.linked, `${name}: open-chat button and QR must point to the same room`);
	check(chat.stacked === (width <= 820), `${name}: unexpected open-chat QR position`);
	return posts.length;
}

async function checkDrawer(page, name, screenshot) {
	const toggle = page.locator('[data-nav-toggle]');
	const drawer = page.locator('#site-nav');
	await toggle.click();
	await drawer.waitFor();
	check(await toggle.getAttribute('aria-expanded') === 'true', `${name}: drawer did not open`);

	// Geometry detects an intersecting drawer and hit testing detects a backdrop over the text.
	const geometry = await page.evaluate(() => {
		const brand = document.querySelector('.site-brand');
		const mark = brand.querySelector('.site-brand-mark');
		const range = document.createRange();
		range.selectNodeContents(mark);
		const text = range.getBoundingClientRect();
		const panel = document.querySelector('#site-nav').getBoundingClientRect();
		const button = document.querySelector('[data-nav-toggle]').getBoundingClientRect();
		const overlap = Math.max(0, Math.min(text.right, panel.right) - Math.max(text.left, panel.left)) *
			Math.max(0, Math.min(text.bottom, panel.bottom) - Math.max(text.top, panel.top));
		return {
			overlap,
			brandVisible: [text.left + 1, text.right - 1].every((x) =>
				brand.contains(document.elementFromPoint(x, (text.top + text.bottom) / 2))),
			brandFits: mark.scrollWidth <= Math.ceil(mark.getBoundingClientRect().width),
			drawerFits: panel.left >= 0 && panel.right <= innerWidth && panel.bottom <= innerHeight + 1,
			toggleFits: button.left >= 0 && button.right <= innerWidth,
		};
	});
	check(geometry.overlap === 0 && geometry.brandVisible && geometry.brandFits &&
		geometry.drawerFits && geometry.toggleFits, `${name}: drawer layout ${JSON.stringify(geometry)}`);
	if (screenshot) await page.screenshot({ path: screenshot });

	await page.locator('[data-nav-close]').click();
	await drawer.waitFor({ state: 'hidden' });
	check(await toggle.getAttribute('aria-expanded') === 'false', `${name}: close button did not close drawer`);
	await toggle.click();
	await drawer.waitFor();
	await page.keyboard.press('Escape');
	await drawer.waitFor({ state: 'hidden' });
	check(await toggle.getAttribute('aria-expanded') === 'false', `${name}: Escape did not close drawer`);
}

async function checkCrumbs(page, expected, name) {
	const nav = page.getByRole('navigation', { name: '경로' });
	const links = await nav.locator(':scope > ol > li:not([hidden]) > a, :scope > a').evaluateAll((nodes) =>
		nodes.map((node) => [node.textContent.trim(), node.getAttribute('href'), node.getAttribute('aria-current')]));
	check(JSON.stringify(links) === JSON.stringify(expected.map(([label, href], index) =>
		[label, href, index === expected.length - 1 ? 'page' : null])), `${name}: unexpected breadcrumb ${JSON.stringify(links)}`);
	const schema = JSON.parse(await page.locator('#site-bc-ld').textContent());
	check(schema['@type'] === 'BreadcrumbList' &&
		JSON.stringify(schema.itemListElement.map((item) => [item.name, item.item])) ===
		JSON.stringify(expected.map(([label, href]) => [label, new URL(href, 'https://sreborn.net').href])),
		`${name}: incorrect breadcrumb structured data`);
}

async function ensureDrawer(page, mobile) {
	const toggle = page.locator('[data-nav-toggle]');
	if (mobile && await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
}

async function checkActiveNav(page, section, child, name) {
	check(await page.locator(`[data-nav-pillar="${section}"].is-current`).count() === 1,
		`${name}: wrong active pillar`);
	if (child) check(await page.locator(`#site-sub-${section} [data-nav-child="${child}"][aria-current="page"]`).count() === 1 &&
		await page.locator(`#site-sub-${section} [aria-current="page"]`).count() === 1,
		`${name}: wrong active submenu item`);
}

async function checkLectureState(page, slot, name) {
	await page.locator(`[data-bc-current][href="${slot.href}"]`).waitFor();
	await checkCrumbs(page, [['홈', '/'], ['AI ACADEMY', lectureHome], [slot.label, slot.href]], name);
	await checkActiveNav(page, 'lectures', slot.id, name);
}

async function checkLectureNavigation(page, base, mobile, name, screenshot) {
	const button = page.getByRole('button', { name: 'AI ACADEMY 하위메뉴' });
	const submenu = page.locator('#site-sub-lectures');
	const toggle = page.locator('[data-nav-toggle]');
	const crumbs = page.getByRole('navigation', { name: '경로' });
	await ensureDrawer(page, mobile);
	await page.locator('#site-nav').getByRole('link', { name: 'AI ACADEMY', exact: true }).click();
	await page.waitForURL(new URL(lectureHome, base).href);
	await checkCrumbs(page, [['홈', '/'], ['AI ACADEMY', lectureHome]], name);

	for (const slot of lectureSlots) {
		await ensureDrawer(page, mobile);
		await button.click();
		await submenu.waitFor();
		if (screenshot && slot === lectureSlots[0]) await page.screenshot({ path: screenshot });
		const links = await submenu.getByRole('link').evaluateAll((items) =>
			items.map((link) => [link.textContent.trim(), link.getAttribute('href')]));
		check(JSON.stringify(links) === JSON.stringify(lectureSlots.map(({ label, href }) => [label, href])),
			`${name}: unexpected Academy menu links`);
		await button.press('Escape');
		await submenu.waitFor({ state: 'hidden' });
		check(await button.getAttribute('aria-expanded') === 'false', `${name}: Escape did not close Academy submenu`);

		await button.click();
		await submenu.getByRole('link', { name: slot.label, exact: true }).click();
		await page.waitForURL(new URL(slot.href, base).href);
		await submenu.waitFor({ state: 'hidden' });
		if (mobile) check(await toggle.getAttribute('aria-expanded') === 'false', `${name}: drawer remained open after ${slot.label}`);
		await checkLectureState(page, slot, name);

	}

	const practice = lectureSlots[1];
	await crumbs.locator('.site-bc-switch').click();
	const siblingMenu = crumbs.getByRole('menu');
	await siblingMenu.waitFor();
	const menuBox = await siblingMenu.boundingBox();
	check(menuBox.x >= 0 && menuBox.x + menuBox.width <= page.viewportSize().width + 1,
		`${name}: breadcrumb switcher extends past the viewport`);
	await siblingMenu.getByRole('menuitem', { name: practice.label, exact: true }).click();
	await page.waitForURL(new URL(practice.href, base).href);
	await checkLectureState(page, practice, name);

	await crumbs.getByRole('link', { name: 'AI ACADEMY', exact: true }).click();
	await page.waitForURL(new URL(lectureHome, base).href);
	await checkCrumbs(page, [['홈', '/'], ['AI ACADEMY', lectureHome]], name);
	await crumbs.getByRole('link', { name: '홈', exact: true }).click();
	await page.waitForURL(new URL('/', base).href);
}

async function checkTopics(page, base, mobile, name, preference, scheme) {
	const nav = page.locator('#site-nav');
	const button = nav.getByRole('button', { name: 'AI LAB 하위메뉴' });
	const menu = page.locator('#site-sub-research');
	await ensureDrawer(page, mobile);
	await nav.getByRole('link', { name: 'AI LAB', exact: true }).click();
	await page.waitForURL(new URL('/blog/', base).href);
	await checkCrumbs(page, [['홈', '/'], ['AI LAB', '/blog/']], name);
	check(await page.locator('#blog-content-title').innerText() === 'AI LAB', `${name}: wrong LAB heading`);
	check(await page.locator('[data-taxonomy-post]:visible').count() === 394, `${name}: wrong AI LAB count`);
	await page.getByRole('link', { name: '입문 글 보기' }).click();
	await page.waitForURL(new URL('/blog/?level=beginner#blog-filters', base).href);
	await page.locator('[data-facet="level"] [data-value="beginner"][aria-pressed="true"]').waitFor();
	check(await page.locator('[data-taxonomy-post]:visible').count() === 215, `${name}: wrong beginner count`);

	for (const [id, label, total] of topicSlots) {
		const href = `/blog/topics/${id}/`;
		await ensureDrawer(page, mobile);
		await button.click();
		await menu.waitFor();
		const links = await menu.getByRole('link').evaluateAll((nodes) =>
			nodes.map((link) => [link.textContent.trim(), link.getAttribute('href')]));
		check(JSON.stringify(links) === JSON.stringify(topicSlots.map(([slug, name]) => [name, `/blog/topics/${slug}/`])),
			`${name}: unexpected LAB topic menu links`);
		await menu.getByRole('link', { name: label, exact: true }).click();
		await page.waitForURL(new URL(href, base).href);
		await checkTheme(page, preference, scheme, `${name} ${id}`);
		await checkCrumbs(page, [['홈', '/'], ['AI LAB', '/blog/'], [label, href]], name);
		await checkActiveNav(page, 'research', `topic-${id}`, name);
		const cards = page.locator('[data-taxonomy-post]');
		check(await cards.count() === total && await page.locator('[data-taxonomy-post]:visible').count() === total,
			`${name}: wrong article count for ${id}`);
		const format = await cards.first().getAttribute('data-format');
		const options = page.locator('[data-facet="format"] button');
		const levels = page.locator('[data-facet="level"] button');
		check(await options.count() === 9 && await levels.count() === 4, `${name}: wrong facet options`);
		await page.locator(`[data-facet="format"] [data-value="${format}"]`).click();
		await page.locator('[data-facet="level"] [data-value="beginner"]').click();
		check(await page.locator('#blog-content-title').innerText() === label, `${name}: missing topic heading after filtering ${id}`);
		const matches = await page.locator('[data-taxonomy-post]:visible').count();
		const expected = await page.locator(`[data-taxonomy-post][data-format="${format}"][data-difficulty="beginner"]`).count();
		check(matches === expected &&
			(await page.locator('[data-taxonomy-count]').innerText()) === `${expected}편`, `${name}: facet intersection ${id}`);
		const viewportFits = await page.locator('#blog-filters').evaluate((element) =>
			element.scrollWidth <= element.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1);
		check(viewportFits, `${name}: topic page or filters overflow ${id}`);
		if (shots && id === 'basics' && [320, 1280].includes(page.viewportSize().width)) {
			await page.screenshot({ path: path.join(shots, `topic-${page.viewportSize().width}-${preference}-${scheme}.png`) });
		}
		const schema = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
			nodes.map((node) => JSON.parse(node.textContent)));
		check(schema.some((item) => item['@type'] === 'CollectionPage' && item.name === label &&
			item.url === new URL(href, 'https://sreborn.net').href), `${name}: missing CollectionPage schema ${id}`);
	}
}

async function checkDetailCrumbs(page, base) {
	const checks = [
		['/blog/orchestration/react-pattern/', 'AI LAB', '/blog/', '에이전트·개발', '/blog/topics/building/', 'research', 'topic-building'],
		['/blog/aerini/ai-discharge-summary/', 'AI LAB', '/blog/', '진료·업무', '/blog/topics/clinic/', 'research', 'topic-clinic'],
		['/blog/doctor-ai/ai-hallucination-medical/', 'AI ACADEMY', lectureHome, '강의', courseList, 'lectures', 'lectures-course'],
		['/blog/mini-academy-hermes-participant-lab-2026/', 'AI ACADEMY', lectureHome, '실습', lectureHome + '#practice', 'lectures', 'lectures-practice'],
		['/blog/mini-academy-hermes-agent-lecture-2026/', 'AI ACADEMY', lectureHome, '발표·기록', lectureHome + '#talks', 'lectures', 'lectures-record'],
	];
	for (const [route, pillar, pillarHref, child, childHref, sectionId, childId] of checks) {
		await openPage(page, base + route);
		const title = await page.locator('h1').first().innerText();
		await checkCrumbs(page, [['홈', '/'], [pillar, pillarHref], [child, childHref], [title, route]], route);
		await checkActiveNav(page, sectionId, childId, route);
		const crumbs = page.getByRole('navigation', { name: '경로' });
		await crumbs.getByRole('link', { name: child, exact: true }).click();
		await page.waitForURL(new URL(childHref, base).href);
	}
	await openPage(page, base + '/');
	await page.locator('#site-nav').getByRole('button', { name: '소개', exact: true }).click();
	await page.locator('#site-sub-about').getByRole('link', { name: 'S-REBORN LAB', exact: true }).click();
	await page.waitForURL(new URL('/lab/', base).href);
	await checkCrumbs(page, [['홈', '/'], ['소개', '/about/'], ['S-REBORN LAB', '/lab/']], 'S-REBORN LAB');
	await checkActiveNav(page, 'about', 'about-lab', 'S-REBORN LAB');
	await openPage(page, base + '/lectures/daemire-crm-2026/');
	const lectureLabel = await page.locator('[data-bc-current]').innerText();
	check(lectureLabel !== '발표·기록', 'Web lecture breadcrumb is missing its title');
	await checkCrumbs(page, [['홈', '/'], ['AI ACADEMY', lectureHome], ['발표·기록', lectureHome + '#talks'],
		[lectureLabel, '/lectures/daemire-crm-2026/']], 'Web lecture breadcrumb');
	await openPage(page, base + '/tutorials/crm-scenarios/');
	await checkCrumbs(page, [['홈', '/'], ['AI ACADEMY', lectureHome], ['실습', lectureHome + '#practice'],
		['CRM AI 실습 라이브러리', '/tutorials/crm-scenarios/']], 'CRM breadcrumb');
	await openPage(page, base + '/blog/?category=aerini');
	await page.locator('[data-taxonomy-count]').filter({ hasText: '120편' }).waitFor();
	await openPage(page, base + '/blog/?q=Codex');
	await page.locator('#blog-content-title').filter({ hasText: '검색 결과' }).waitFor();
	check(await page.locator('[data-taxonomy-post]:visible').count() > 0, 'Blog search returned no results');
}
async function checkCompactSearch(page, base) {
	for (const width of [320, 390, 480]) {
		await page.setViewportSize({ width, height: 780 });
		await openPage(page, base + courseList);
		const toggle = page.locator('[data-search-toggle]');
		const input = page.locator('#search-input');
		const box = await toggle.boundingBox();
		check(box?.width === 44 && box?.height === 44 && await input.isHidden(), `Compact search at ${width}px`);
		await page.locator('.site-brand').focus();
		await page.keyboard.press('Tab');
		check(await toggle.evaluate((node) => node === document.activeElement && getComputedStyle(node).outlineStyle !== 'none'),
			`Search toggle focus at ${width}px`);
		await page.keyboard.press('Enter');
		check(await input.evaluate((node) => node === document.activeElement && node.getBoundingClientRect().width > 200) &&
			await toggle.getAttribute('aria-expanded') === 'true', `Search open and focus at ${width}px`);
		await input.press('Escape');
		check(await input.isHidden() && await toggle.evaluate((node) => node === document.activeElement),
			`Search Escape returns focus at ${width}px`);
		await page.keyboard.press('Control+k');
		check(await input.evaluate((node) => node === document.activeElement), `Search shortcut at ${width}px`);
	}
	await page.setViewportSize({ width: 768, height: 900 });
	await openPage(page, base + courseList);
	check(await page.locator('[data-search-toggle]').isHidden() && await page.locator('#search-input').isVisible(),
		'Non-home search should remain inline at 768px');
}

async function checkCourseResources(page, base) {
	await openPage(page, base + courseList);
	const parts = await page.locator('[data-course-part]').evaluateAll((sections) =>
		sections.map((section) => [...section.querySelectorAll('ol a')].map((link) => link.getAttribute('href'))));
	check(JSON.stringify(parts.map((part) => part.length)) === '[10,5,5,5]', 'Wrong counts for four course parts');
	const links = new Set(parts.flat());
	check(links.size === 25, 'Expected 25 distinct lesson links');
	for (const href of links) {
		const response = await page.request.get(new URL(href, base).href, { maxRedirects: 0 });
		check(response.status() === 200 && href.startsWith('/blog/doctor-ai/'), `Lesson URL failed: ${href}`);
		await response.dispose();
	}
	await openPage(page, base + '/blog/topics/clinic/');
	const related = await page.getByRole('complementary', { name: '관련 강의' }).getByRole('link').evaluateAll((nodes) =>
		nodes.map((node) => node.getAttribute('href')));
	check(JSON.stringify(related) === JSON.stringify([courseList + '#prompts', courseList + '#cases']), 'Clinic links to course parts');
	return links.size;
}

async function checkResources(page, base) {
	await openPage(page, base + lectureHome);
	const lectureRoutes = await page.locator('main .archive-row > a[href^="/"]').evaluateAll((links) =>
		[...new Set(links.map((link) => link.getAttribute('href')))]);
	check(lectureRoutes.length > 0, 'No lecture hub routes found');
	const downloads = new Set();
	for (const route of lectureRoutes) {
		const response = await page.request.get(new URL(route, base).href);
		check(response.ok(), `Lecture/CRM route returned ${response.status()}: ${route}`);
		await response.dispose();
	}
	for (const route of ['/lecture-materials/2026-11-08/archive/', '/lecture-materials/kang-sehee/', '/tutorials/crm-scenarios/']) {
		await openPage(page, base + route);
		const links = await page.locator('main a[href^="/downloads/"], a[download][href^="/downloads/"]').evaluateAll((nodes) =>
			nodes.map((link) => link.getAttribute('href')));
		check(links.length > 0, `No download links found: ${route}`);
		links.forEach((href) => downloads.add(href));
	}
	const crm = await page.locator('section.scenario').evaluateAll((sections) => ({
		ids: [...new Set(sections.map((section) => section.id))],
		groups: [...new Set(sections.map((section) => section.dataset.group))],
	}));
	check(crm.ids.length >= 82 && Array.from({ length: 8 }, (_, index) => `PP0${index + 1}`).every((group) => crm.groups.includes(group)),
		`Unexpected built CRM inventory: ${crm.ids.length} scenarios, ${crm.groups.length} groups`);
	for (const href of downloads) {
		const response = await page.request.get(new URL(href, base).href);
		check(response.ok() && (await response.body()).length > 0 && !response.headers()['content-type']?.includes('text/html'),
			`Download unavailable: ${href}`);
		await response.dispose();
	}
	return { lectureRoutes: lectureRoutes.length, scenarios: crm.ids.length, groups: crm.groups.length, downloads: downloads.size };
}

async function checkThemeChanges(page, context, base) {
	await openPage(page, base + '/');
	const other = await context.newPage();
	try {
		await openPage(other, base + lectureHome);
		const picker = page.locator('[data-theme-select]');
		await picker.selectOption('dark');
		await other.locator('html[data-theme-preference="dark"][data-theme="dark"]').waitFor();
		await picker.selectOption('system');
		await other.emulateMedia({ colorScheme: 'dark' });
		await other.locator('html[data-theme-preference="system"][data-theme="dark"]').waitFor();
		await other.emulateMedia({ colorScheme: 'light' });
		await other.locator('html[data-theme-preference="system"][data-theme="light"]').waitFor();
	} finally {
		await other.close();
	}
}

async function run() {
	if (!process.env.QA_BASE_URL && !existsSync(path.join(dist, 'index.html'))) {
		throw new Error('dist/index.html is missing. Run npm run build first.');
	}
	if (shots) await mkdir(shots, { recursive: true });
	const local = process.env.QA_BASE_URL ? null : await startStatic(dist);
	const base = (process.env.QA_BASE_URL || local.base).replace(/\/$/, '');
	let browser;
	const results = [];
	let resources;
	let themeChanges = false;
	let courses = 0;
	try {
		browser = await chromium.launch({
			executablePath: chromePath(),
			args: ['--no-sandbox', '--disable-dev-shm-usage'],
		});
		for (const [preference, scheme] of themeCases) {
			const context = await browser.newContext({ colorScheme: scheme });
			const page = await context.newPage();
			page.setDefaultTimeout(8000);
			for (const width of widths) {
				const name = `${preference}/${scheme} @${width}px`;
				console.log(`Checking ${name}`);
				const mobile = width < 1201;
				const screenshot = shots && preference !== 'system' && [320, 390, 1280].includes(width)
					? path.join(shots, `menu-open-${width}-${preference}.png`) : null;
				await page.setViewportSize({ width, height: width >= 768 ? 900 : 780 });
				await openPage(page, base + '/');
				await page.locator('[data-theme-select]').selectOption(preference);
				await page.reload({ waitUntil: 'domcontentloaded' });
				await checkTheme(page, preference, scheme, name);
				const posts = await checkHome(page, width, name);
				if (mobile) await checkDrawer(page, name, screenshot);

				await checkLectureNavigation(page, base, mobile, name, mobile ? null : screenshot);
				await checkTheme(page, preference, scheme, name);
				await checkTopics(page, base, mobile, name, preference, scheme);

				if (mobile) {
					await openPage(page, base + articlePath);
					const paragraph = page.locator('.blog-post-prose p').first();
					check(await fontSize(page.locator('body')) === '16px' && await fontSize(paragraph) === '16px',
						`${name}: article body and paragraph must be 16px`);
					if (width === 320) await checkDrawer(page, `${name} article`);
				}
				results.push({ name, posts, lectureLinks: lectureSlots.length });
			}
			if (!resources) {
				resources = await checkResources(page, base);
				await checkDetailCrumbs(page, base);
				courses = await checkCourseResources(page, base);
			}
			await checkCompactSearch(page, base);
			if (preference === 'system' && scheme === 'light') {
				await checkThemeChanges(page, context, base);
				themeChanges = true;
			}
			await context.close();
		}
	} finally {
		await browser?.close();
		if (local) await new Promise((resolve) => local.server.close(resolve));
	}
	console.log(JSON.stringify({
		ok: failures.length === 0,
		matrix: results.length,
		homeRows: results[0]?.posts,
		lectureClicks: results.reduce((total, result) => total + result.lectureLinks, 0),
		topicClicks: results.length * topicSlots.length,
		themeChanges,
		courses,
		compactSearchCases: themeCases.length * 3,
		...resources,
		failures,
	}, null, 2));
	if (failures.length) process.exitCode = 1;
}

run().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
