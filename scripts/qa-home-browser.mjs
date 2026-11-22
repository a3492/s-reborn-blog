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
const starterPosts = [
	[articlePath, 'AI가 뭐예요?', '/blog/topics/basics/', 'AI 이해'],
	['/blog/orchestration/workflow-patterns/', 'AI 워크플로우 패턴 5가지', '/blog/topics/building/', '에이전트·개발'],
	['/blog/orchestration/what-is-orchestration/', '오케스트레이션이란 무엇인가', '/blog/topics/building/', '에이전트·개발'],
];

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

function startStatic(directory, categoryRedirects) {
	const exactCategoryRedirects = new Map(categoryRedirects.filter(([route]) => !route.includes(':cat'))
		.map(([route, target, code]) => [route, { target, code: Number(code) }]));
	const wildcardCategoryRedirects = new Map(categoryRedirects.filter(([route]) => route.includes(':cat'))
		.map(([route, target, code]) => [route, { target, code: Number(code) }]));
	return new Promise((resolve) => {
		const server = createServer(async (req, res) => {
			try {
				const url = new URL(req.url || '/', 'http://127.0.0.1');
				const categoryMatch = /^\/blog\/category\/([^/]+)(\/?)$/.exec(url.pathname);
				if (categoryMatch) {
					const [, category, slash] = categoryMatch;
					const rule = exactCategoryRedirects.get(url.pathname) ?? wildcardCategoryRedirects.get(`/blog/category/:cat${slash}`);
					if (rule) {
						res.writeHead(rule.code, { location: rule.target.replace(':cat', category) });
						res.end();
						return;
					}
				}
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
		return row.matches('li') &&
			row.children.length === 2 && [...row.childNodes].every((node) => node.nodeType !== 3 || !node.textContent.trim()) &&
			title?.matches('a.portal-post-title[href^="/blog/"]') && Boolean(title.textContent.trim()) &&
			getComputedStyle(title).fontSize === '16px' &&
			meta?.matches('.portal-meta') && meta.children.length === 3 &&
			category?.matches('a.portal-category[href^="/blog/topics/"], a.portal-category[href^="/lecture-materials/"]') &&
			Boolean(category.textContent.trim()) && separator?.getAttribute('aria-hidden') === 'true' &&
			date?.matches('time[datetime]') && Boolean(date.textContent.trim());
	}));
	check(posts.length > 0 && posts.every(Boolean), `${name}: home rows must contain a linked title, category and date only`);
	const dates = await page.locator('#latest .portal-row-post time').evaluateAll((nodes) =>
		nodes.map((node) => Date.parse(node.getAttribute('datetime'))));
	check(dates.every((date, index) => Number.isFinite(date) && (!index || dates[index - 1] >= date)),
		`${name}: home posts are not ordered by latest date`);
	check(await fontSize(page.locator('body')) === '16px', `${name}: home body must be 16px`);
	check(await page.locator('#latest').evaluate((section) => section.scrollWidth <= section.clientWidth + 1),
		`${name}: home latest section overflows`);
	const starter = page.locator('#home-starter');
	check(await starter.getByRole('heading', { name: '처음이라면' }).isVisible(), `${name}: home starter heading is missing`);
	const starterRows = await starter.locator('.portal-row-post').evaluateAll((rows) => rows.map((row) => {
		const [title, meta] = row.children;
		const [category] = meta?.children ?? [];
		return row.matches('li') && row.children.length === 2 && meta?.children.length === 1 &&
			title?.matches('a.portal-post-title') && category?.matches('a.portal-category') &&
			getComputedStyle(title).fontSize === '16px' && !row.querySelector('p, time') && [
				title.getAttribute('href'), title.textContent.trim(), category.getAttribute('href'), category.textContent.trim(),
			];
	}));
	check(starterRows.length === starterPosts.length && starterRows.every((row, index) => {
		const [href, title, topic, label] = starterPosts[index];
		return row && row[0] === href && row[1].startsWith(title) && row[2] === topic && row[3] === label;
	}), `${name}: home starter must show the three linked titles and categories only`);
	check(await starter.evaluate((section) => section.previousElementSibling?.id === 'latest' &&
		section.scrollWidth <= section.clientWidth + 1 &&
		document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
		`${name}: home starter must follow the latest section without horizontal overflow`);

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
	return { posts: posts.length, starters: starterRows.length };
}

async function checkStarterLinks(page, base) {
	await openPage(page, base + '/');
	for (const [article] of starterPosts) {
		await page.locator(`#home-starter a.portal-post-title[href="${article}"]`).click();
		await page.waitForURL(base + article);
		check(await page.locator('.blog-post-main h1').isVisible(), `Home starter article unavailable: ${article}`);
		await openPage(page, base + '/');
	}
}

async function checkStarterAnchor(page, base, name) {
	await page.locator('#home-starter').getByRole('link', { name: '처음이라면 더 보기' }).click();
	await page.waitForURL(base + '/blog/#start-here');
	const heading = page.locator('#start-here').getByRole('heading', { name: '처음이라면' });
	await heading.waitFor();
	const boxes = await heading.evaluate(async (title) => {
		await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
		const header = document.querySelector('[data-site-header]').getBoundingClientRect();
		const intro = title.nextElementSibling?.getBoundingClientRect();
		return { headerEnd: header.bottom, titleTop: title.getBoundingClientRect().top,
			introEnd: intro?.bottom, viewportEnd: innerHeight };
	});
	check(boxes.titleTop >= boxes.headerEnd && boxes.introEnd <= boxes.viewportEnd,
		`${name}: starter heading or introduction is obscured after following the anchor: ${JSON.stringify(boxes)}`);
}

async function checkHomeLabels(page, base) {
	await openPage(page, base + '/');
	const rows = await page.locator('#latest .portal-row-post').evaluateAll((nodes) => nodes.map((row) => ({
		article: row.querySelector('.portal-post-title').getAttribute('href'),
		category: row.querySelector('.portal-category').getAttribute('href'),
		label: row.querySelector('.portal-category').textContent.trim(),
		shownDate: row.querySelector('time').getAttribute('datetime'),
		shownDateText: row.querySelector('time').textContent.trim(),
	})));
	check(rows.length === 8, 'Expected eight home articles');
	const categories = new Set();
	for (const { article, category, label, shownDate, shownDateText } of rows) {
		await openPage(page, base + article);
		const badge = await page.locator('.blog-post-category').innerText();
		const sidebar = page.locator('[data-taxonomy-sidebar] a[aria-current="location"]');
		check(label === badge.trim() && category === await sidebar.getAttribute('href'),
			`Home category differs from article: ${article}`);
		const schema = JSON.parse(await page.locator('#article-json-ld').textContent());
		const articleDates = await page.locator('.blog-post-meta time').evaluateAll((nodes) =>
			nodes.map((node) => node.getAttribute('datetime')));
		const expectedDates = schema.dateModified ? [schema.datePublished, schema.dateModified] : [schema.datePublished];
		check(JSON.stringify(articleDates) === JSON.stringify(expectedDates) &&
			shownDate === (schema.dateModified ?? schema.datePublished) &&
			shownDateText.startsWith('업데이트 ') === Boolean(schema.dateModified),
			`Home or article date differs from metadata: ${article}`);
		categories.add(category);
	}
	for (const category of categories) {
		const response = await page.request.get(base + category.split('#')[0]);
		check(response.ok(), `Home category target unavailable: ${category}`);
		await response.dispose();
	}
	await openPage(page, base + '/');
	await page.locator('#latest .portal-row-post .portal-category').first().click();
	await page.waitForURL(base + rows[0].category);

	const course = '/blog/doctor-ai/ai-hallucination-medical/';
	const englishCourse = '/en' + course;
	await openPage(page, base + '/en/blog/');
	check(await page.locator('[data-taxonomy-sidebar] [data-sidebar-label]').count() === 7 &&
		await page.locator('.blog-card:visible').count() === 394, 'English AI LAB listing uses the wrong taxonomy');
	await openPage(page, base + '/en/blog/?category=doctor-ai');
	const courseCard = page.locator(`a.blog-card[href="${englishCourse}"]`);
	await courseCard.waitFor();
	check((await courseCard.locator('.blog-card-cat').innerText()) === 'Courses', 'English course label is stale');

	await openPage(page, base + '/');
	await page.locator('#portal-query').fill('AI 환각(Hallucination)이란');
	const searchLabel = page.locator(`#search-results a[href="${course}"] .sr-cat`);
	await searchLabel.waitFor();
	check((await searchLabel.innerText()) === '강의', 'Modern search course label is stale');

	await openPage(page, base + '/search.html');
	await page.locator('#searchInput').fill('AI 환각');
	const legacyLabel = page.locator('a.result-card[href$="/ai-hallucination-medical.html"] .result-category');
	await legacyLabel.waitFor();
	check((await legacyLabel.innerText()) === '강의', 'Legacy search course label is stale');

	const response = await page.request.get(base + '/rss.xml');
	const items = await page.evaluate((xml) => {
		const document = new DOMParser().parseFromString(xml, 'application/xml');
		return Object.fromEntries([...document.querySelectorAll('item')].map((item) => [
			new URL(item.querySelector('link').textContent).pathname, item.querySelector('category')?.textContent,
		]));
	}, await response.text());
	await response.dispose();
	check(Object.keys(items).length === 421 && items[course] === '강의' &&
		rows.every(({ article, label }) => items[article] === label), 'RSS categories differ from article taxonomy');
	return rows.length;
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
	const starter = page.locator('[data-taxonomy-intro]');
	check((await starter.innerText()).includes('애린이 코너') && await starter.locator('ul a').count() === 3,
		`${name}: missing beginner reading group`);
	await page.getByRole('link', { name: '입문 글 보기' }).click();
	await page.waitForURL(new URL('/blog/?level=beginner#blog-filters', base).href);
	await page.locator('[data-facet="level"] [data-value="beginner"][aria-pressed="true"]').waitFor();
	check(await page.locator('[data-taxonomy-post]:visible').count() === 215, `${name}: wrong beginner count`);
	const labLevelCounts = await page.locator('[data-level-count]').allTextContents();
	check(labLevelCounts.join(',') === '394,215,64,15', `${name}: wrong LAB level counts`);

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
		check(await page.locator('[data-facet="level"] [data-value="beginner"] [data-level-count]').innerText() === String(expected),
			`${name}: incorrect facet count ${id}`);
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

async function checkArticleSidebars(page, base, preference, scheme) {
	const labSlugs = [
		'aerini/what-is-ai', 'prompt-engineering/zero-shot-vs-few-shot', 'orchestration/react-pattern',
		'aerini/ai-discharge-summary', 'medical-data-science/survival-analysis-basics',
		'ai-tools-general/gamma-ai-presentation', 'regulations/korean-medical-law-ai',
	];
	const samples = [
		...labSlugs.map((slug, i) => [`/blog/${slug}/`, `/blog/topics/${topicSlots[i][0]}/`]),
		['/blog/doctor-ai/ai-hallucination-medical/', courseList, 'trust', 9],
		['/blog/doctor-ai/drug-interaction-ai/', courseList, 'tools', 4],
		['/blog/doctor-ai/diagnostic-report-prompt/', courseList, 'prompts', 4],
		['/blog/doctor-ai/acute-abdominal-pain-case/', courseList, 'cases', 4],
		['/blog/mini-academy-hermes-participant-lab-2026/', lectureHome + '#practice'],
		['/blog/mini-academy-hermes-agent-lecture-2026/', lectureHome + '#talks'],
		['/en/blog/aerini/what-is-ai/', '/blog/topics/basics/'],
		['/en/blog/doctor-ai/ai-hallucination-medical/', courseList, 'trust', 9],
	];
	for (const width of [320, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		for (const [route, currentHref, part, siblings] of samples) {
			await openPage(page, base + route);
			const name = `${preference}/${scheme} @${width}px ${route}`;
			await checkTheme(page, preference, scheme, name);
			const sidebar = page.locator('[data-taxonomy-sidebar]');
			const body = sidebar.locator('.blog-nav-body');
			if (width === 320) {
				const toggle = sidebar.locator('[data-sidebar-toggle]');
				check(await body.isHidden() && await toggle.getAttribute('aria-expanded') === 'false', `${name}: sidebar should start collapsed`);
				await toggle.press('Enter');
				check(await body.isVisible() && await toggle.getAttribute('aria-expanded') === 'true', `${name}: sidebar keyboard toggle did not open`);
			} else {
				check(await body.isVisible() && await sidebar.locator('[data-sidebar-toggle]').isHidden(), `${name}: desktop sidebar not visible`);
			}

			const items = await body.locator(':scope > a').evaluateAll((nodes) => nodes.map((node) => ({
				href: node.getAttribute('href'),
				label: node.querySelector('[data-sidebar-label]')?.textContent.trim(),
				count: node.querySelector('.blog-nav-count')?.textContent.trim(),
				active: node.getAttribute('aria-current'),
			})));
			const active = items.filter((item) => item.active);
			const crumbs = await page.locator('nav .site-bc-link').evaluateAll((nodes) =>
				nodes.map((node) => ({ label: node.textContent.trim(), href: node.getAttribute('href') })));
			const crumb = crumbs.at(-2);
			check(active.length === 1 && active[0].active === 'location' && active[0].href === currentHref &&
				active[0].href === crumb?.href && active[0].label === crumb?.label,
				`${name}: sidebar and breadcrumb differ`);
			const expected = currentHref.startsWith('/blog/topics/')
				? [[route.startsWith('/en/') ? '/en/blog/' : '/blog/', '394'], ...topicSlots.map(([id, , count]) => [`/blog/topics/${id}/`, String(count)])]
				: [[lectureHome, null], ...lectureSlots.map(({ href }) => [href, null])];
			check(JSON.stringify(items.map(({ href, count }) => [href, count ?? null])) === JSON.stringify(expected),
				`${name}: sidebar order, links or counts are wrong`);

			if (part) {
				const lessons = await sidebar.locator('.sidebar-course li a').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
				check(lessons.length === siblings && new Set(lessons).size === siblings && !lessons.includes(route) &&
					await sidebar.locator('.sidebar-course h2 a').getAttribute('href') === `${courseList}#${part}`,
					`${name}: same-part course links are wrong`);
			}
			if (width === 320) {
				const fits = await sidebar.evaluate((element) => {
					const box = element.getBoundingClientRect();
					return document.documentElement.scrollWidth <= innerWidth && box.left >= 0 && box.right <= innerWidth &&
						element.scrollWidth <= element.clientWidth + 1;
				});
				check(fits, `${name}: horizontal overflow with open sidebar`);
				if (shots && route === '/blog/doctor-ai/ai-hallucination-medical/') {
					await page.screenshot({ path: path.join(shots, `article-sidebar-${preference}-${scheme}.png`) });
				}
				await sidebar.locator('[data-sidebar-toggle]').press('Space');
				check(await body.isHidden(), `${name}: sidebar keyboard toggle did not close`);
			}
		}
	}
	return samples.length * 2;
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
async function checkTagPresentation(page, base) {
	const jobPattern = /\b(?:cu|cl)\d{10}(?:\d{2})?\b|#cu\b|\boriginIds\b/i;
	const bareCue = /["'>\s]cu(?=["'<\s])/i;
	for (const route of [articlePath, '/en' + articlePath]) {
		await openPage(page, base + route);
		const tags = await page.locator('.blog-post-tags .tag').allTextContents();
		check(tags.length > 0 && !tags.some((tag) => jobPattern.test(tag) || tag === '#의료AI' || tag === '#ai'),
			`Incomplete tag normalization on ${route}`);
		const keys = tags.map((tag) => tag.replace(/\s+/g, '').toLowerCase());
		check(new Set(keys).size === keys.length, `Repeated tags on ${route}`);
		const related = await page.locator('.blog-post-related a').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
		check(related.length === 3 && !related.includes(route) && new Set(related).size === 3, `Bad related articles on ${route}`);
	}
	for (const route of ['/', '/blog/', '/en/blog/', '/search.html', '/rss.xml']) {
		const response = await page.request.get(base + route);
		const html = await response.text();
		check(!jobPattern.test(html) && !bareCue.test(html), `Internal workflow tag exposed through ${route}`);
		await response.dispose();
	}
	const samplePaths = ['/blog/ai-tools-general/notebooklm-source-grounded-notes/', '/blog/orchestration/crewai-intro/'];
	for (const path of samplePaths) {
		for (const locale of ['', '/en']) {
			await openPage(page, base + locale + path);
			check(!jobPattern.test(await page.locator('.blog-post-prose').innerText()),
				`Internal workflow tag exposed on article ${locale + path}`);
			check(!(await page.locator('.blog-post-tags .tag').allTextContents()).some((tag) => /^#cu(?:\d+)?$/i.test(tag)),
				`CU is visible in tags on ${locale + path}`);
		}
	}
	await openPage(page, base + '/blog/');
	await page.locator('[data-unassigned-level]').waitFor();
	check((await page.locator('[data-unassigned-level]').innerText()).includes('100편'), 'Incorrect LAB unassigned count');
	return 11;
}

async function checkLegacyCategories(page, base) {
	const csv = await readFile(path.join(root, 'docs/plans/taxonomy-v2-mapping.csv'), 'utf8');
	const grouped = new Map();
	for (const line of csv.trim().split(/\r?\n/).slice(1)) {
		const [, category, cell] = line.split(',');
		const data = grouped.get(category) ?? { cells: new Set(), count: 0 };
		data.cells.add(cell);
		data.count++;
		grouped.set(category, data);
	}
	const hrefFor = (cell) => ({
		'ACADEMY:course': courseList,
		'ACADEMY:practice': lectureHome + '#practice',
		'ACADEMY:talks': lectureHome + '#talks',
	})[cell] ?? `/blog/topics/${cell}/`;
	let migrated = 0;
	for (const [category, { cells, count }] of grouped) {
		const legacy = `/blog/?category=${category}`;
		const target = cells.size === 1 ? hrefFor([...cells][0]) : legacy;
		for (const suffix of ['', '/']) {
			const response = await page.request.get(base + `/blog/category/${category}${suffix}`, { maxRedirects: 0 });
			const location = response.headers().location;
			check(response.status() === 301 && location && new URL(location, base).href === new URL(target, base).href,
				`Legacy 301 failed for ${category}${suffix}`);
			await response.dispose();
		}
		await openPage(page, base + legacy);
		await page.waitForURL(new URL(target, base).href);
		if (cells.size === 1) {
			check(await page.locator('link[rel="canonical"]').getAttribute('href') === new URL(target, 'https://sreborn.net').href,
				`Target canonical failed for ${category}`);
			migrated++;
			continue;
		}
		const note = page.locator('[data-legacy-note]');
		await note.waitFor();
		const links = await note.getByRole('link').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')).sort());
		check(JSON.stringify(links) === JSON.stringify([...cells].map(hrefFor).sort()), `Split guidance failed for ${category}`);
		check(await page.locator('[data-taxonomy-post]:visible').count() === count, `Split listing failed for ${category}`);
		check(await page.locator('link[rel="canonical"]').getAttribute('href') === new URL(legacy, 'https://sreborn.net').href,
			`Split category canonical failed for ${category}`);
	}
	for (const group of ['basics', 'engineering', 'medical', 'trends', 'tools']) {
		await openPage(page, base + `/blog/?group=${group}`);
		await page.locator('[data-taxonomy-list] #blog-filters').waitFor();
		check(await page.locator('[data-taxonomy-post]:visible').count() > 0 &&
			await page.locator('#blog-content-title').innerText() !== 'AI LAB', `Legacy group failed: ${group}`);
	}
	return { legacyCategories: grouped.size, directCategories: migrated, legacyPathChecks: grouped.size * 2, legacyGroups: 5 };
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
	check(await page.locator('[data-course-part] li [data-lecture-draft-badge]').count() === links.size,
		'Expected a writing-in-progress badge on each listed lesson');
	const sitemap = await page.request.get(base + '/sitemap-0.xml');
	const sitemapXml = await sitemap.text();
	check(sitemap.ok(), 'Sitemap unavailable for draft lesson check');
	await sitemap.dispose();
	for (const href of links) {
		const response = await page.request.get(new URL(href, base).href, { maxRedirects: 0 });
		check(response.status() === 200 && href.startsWith('/blog/doctor-ai/'), `Lesson URL failed: ${href}`);
		const html = await response.text();
		check(html.includes('data-lecture-draft-badge') && html.includes('<meta name="robots" content="noindex"') &&
			html.includes('참고문헌 정리 중') && !html.includes('https://example.com') && !sitemapXml.includes(`${href}</loc>`),
			`Lesson draft badge, indexing or reference status is wrong: ${href}`);
		await response.dispose();
	}
	await openPage(page, base + articlePath);
	check(await page.locator('[data-lecture-draft-badge], meta[name="robots"][content*="noindex"]').count() === 0,
		'An AI LAB article received draft lesson metadata');
	await openPage(page, base + '/blog/topics/clinic/');
	const related = await page.getByRole('complementary', { name: '관련 강의' }).getByRole('link').evaluateAll((nodes) =>
		nodes.map((node) => node.getAttribute('href')));
	check(JSON.stringify(related) === JSON.stringify([courseList + '#prompts', courseList + '#cases']), 'Clinic links to course parts');
	return links.size;
}

async function checkUpgradedArticles(page, base) {
	const articles = [
		["/blog/aerini/what-is-ai/", "2026-11-22"],
		["/blog/orchestration/workflow-patterns/", "2026-11-22"],
		["/blog/orchestration/what-is-orchestration/", "2026-11-22"],
		["/blog/ai-tools-general/notebooklm-source-grounded-notes/", "2026-11-22"],
		["/blog/ai-tools-general/midjourney-image-prompt-workflow/", "2026-11-22"],
		["/blog/ai-tools-general/runway-gen-video-overview/", "2026-11-22"],
		["/blog/ai-tools-general/perplexity-ai-search-research/", "2026-11-22"],
		["/blog/ai-tools-general/capcut-ai-captions-effects/", "2026-11-22"],
		["/blog/ai-tools-general/higgsfield-ai-creative-suite/", null],
	];
	const checkedLinks = new Set();
	const viewport = page.viewportSize();
	await page.setViewportSize({ width: 320, height: 780 });
	try {
		for (const [href, updatedDate] of articles) {
			await openPage(page, base + href);
			const prose = page.locator('.blog-post-prose');
			const intro = await prose.locator(':scope > p').first().innerText();
			check(intro === '아래 사례는 설명을 위한 가상의 상황입니다.', `Missing fiction disclosure: ${href}`);
			const article = JSON.parse(await page.locator('#article-json-ld').textContent());
			check((article.dateModified?.slice(0, 10) ?? null) === updatedDate, `Wrong upgrade date: ${href}`);
			check(await prose.locator(':scope > h2').count() >= 5, `Missing expanded explanation or example: ${href}`);
			const figure = prose.locator('[data-editorial-figure]');
			check(await figure.count() === 1, `Unexpected figure count: ${href}`);
			const themePicker = page.locator('[data-theme-select]');
			const originalTheme = await themePicker.inputValue();
			const measurements = [];
			for (const theme of ['light', 'dark']) {
				await themePicker.selectOption(theme);
				measurements.push(await figure.evaluate((element) => {
					const style = getComputedStyle(element);
					const svg = element.querySelector('svg');
					const box = svg?.getBBox();
					return {
						ink: style.color,
						background: style.backgroundColor,
						fits: element.scrollWidth <= element.clientWidth + 1 &&
							element.getBoundingClientRect().right <= innerWidth &&
							(!svg || (box.x >= 0 && box.x + box.width <= svg.viewBox.baseVal.width &&
							box.y >= 0 && box.y + box.height <= svg.viewBox.baseVal.height)),
						labeled: Boolean(element.querySelector('figcaption')?.textContent.trim()) &&
							Boolean((svg ?? element.querySelector('[role="img"]'))?.getAttribute('aria-label')?.trim()),
					};
				}));
			}
			check(measurements[0].ink !== measurements[1].ink && measurements.every(({ background, fits, labeled }) =>
				background === 'rgba(0, 0, 0, 0)' && fits && labeled), `Figure theme, layout or caption: ${href} ${JSON.stringify(measurements)}`);
			await themePicker.selectOption(originalTheme);
			if (href === articlePath) check(article.timeRequired === 'PT3M', 'Expanded AI introduction reading time should be three minutes');
			const links = await prose.locator(':scope > ul a[href^="/blog/"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
			check(links.length >= 2 && links.length <= 4 && links.some((link) => link.startsWith('/blog/topics/')),
				`Wrong article reading links: ${href}`);
			check((await prose.innerText()).search(/편집 초안|스테이크|87%|ORCHESTRATION_ROUNDPREP_BIBLE/) === -1,
				`Editorial placeholder or unsupported sample result: ${href}`);
			links.forEach((link) => checkedLinks.add(link));
		}
	} finally {
		await page.setViewportSize(viewport);
	}
	for (const href of checkedLinks) {
		const response = await page.request.get(base + href, { maxRedirects: 0 });
		check(response.ok(), `Upgraded article link unavailable: ${href}`);
		await response.dispose();
	}
	return articles.length;
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
	const categoryRedirects = process.env.QA_BASE_URL ? [] : (await readFile(path.join(dist, '_redirects'), 'utf8'))
		.split(/\r?\n/).map((line) => line.trim().split(/\s+/)).filter(([route]) => route.startsWith('/blog/category/'));
	const local = process.env.QA_BASE_URL ? null : await startStatic(dist, categoryRedirects);
	const base = (process.env.QA_BASE_URL || local.base).replace(/\/$/, '');
	let browser;
	const results = [];
	let resources;
	let themeChanges = false;
	let courses = 0;
	let sidebarCases = 0;
	let homeLabelChecks = 0;
	let legacy;
	let tagSurfaces = 0;
	let upgradedArticles = 0;
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
				const { posts, starters } = await checkHome(page, width, name);
				if (mobile) await checkDrawer(page, name, screenshot);
				await checkStarterAnchor(page, base, name);

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
				results.push({ name, posts, starters, lectureLinks: lectureSlots.length });
			}
			if (!resources) {
				resources = await checkResources(page, base);
				await checkDetailCrumbs(page, base);
				homeLabelChecks = await checkHomeLabels(page, base);
				await checkStarterLinks(page, base);
				courses = await checkCourseResources(page, base);
				upgradedArticles = await checkUpgradedArticles(page, base);
				legacy = await checkLegacyCategories(page, base);
				tagSurfaces = await checkTagPresentation(page, base);
			}
			await checkCompactSearch(page, base);
			sidebarCases += await checkArticleSidebars(page, base, preference, scheme);
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
		starterRows: results[0]?.starters,
		starterAnchorCases: results.length,
		lectureClicks: results.reduce((total, result) => total + result.lectureLinks, 0),
		topicClicks: results.length * topicSlots.length,
		themeChanges,
		courses,
		upgradedArticles,
		compactSearchCases: themeCases.length * 3,
		sidebarCases,
		homeLabelChecks,
		...resources,
		...legacy,
		tagSurfaces,
		failures,
	}, null, 2));
	if (failures.length) process.exitCode = 1;
}

run().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
