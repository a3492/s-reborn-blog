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
const lectureSlots = [
	{ id: 'lectures-home', label: '강연·자료 홈', hash: '' },
	{ id: 'lectures-files', label: '자료', hash: '#materials' },
	{ id: 'lectures-practice', label: '실습', hash: '#practice' },
	{ id: 'lectures-record', label: '발표·기록', hash: '#talks' },
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

async function checkLectureState(page, slot, name) {
	const crumbs = page.getByRole('navigation', { name: '경로' });
	const current = crumbs.locator('[data-bc-current]');
	await current.and(page.locator(`[data-child-id="${slot.id}"]`)).waitFor();
	check(await current.innerText() === slot.label &&
		await current.getAttribute('href') === lectureHome + slot.hash &&
		await current.getAttribute('aria-current') === 'page', `${name}: incorrect current breadcrumb for ${slot.label}`);
	check(await page.locator(`#site-sub-lectures [data-nav-child="${slot.id}"]`).getAttribute('aria-current') === 'page' &&
		await page.locator('#site-sub-lectures [aria-current="page"]').count() === 1,
		`${name}: incorrect active lecture menu item for ${slot.label}`);
	const schema = JSON.parse(await page.locator('#site-bc-ld').textContent());
	check(schema['@type'] === 'BreadcrumbList' && schema.itemListElement.at(-1)?.name === slot.label,
		`${name}: incorrect breadcrumb structured data for ${slot.label}`);
}

async function checkLectureNavigation(page, base, mobile, name, screenshot) {
	const button = page.locator('[aria-controls="site-sub-lectures"]');
	const submenu = page.locator('#site-sub-lectures');
	const toggle = page.locator('[data-nav-toggle]');
	const crumbs = page.getByRole('navigation', { name: '경로' });

	for (const slot of lectureSlots) {
		if (mobile) await toggle.click();
		await button.click();
		await submenu.waitFor();
		if (screenshot && slot === lectureSlots[0]) await page.screenshot({ path: screenshot });
		const links = await submenu.getByRole('link').evaluateAll((items) =>
			items.map((link) => [link.textContent.trim(), link.getAttribute('href')]));
		check(JSON.stringify(links) === JSON.stringify(lectureSlots.map(({ label, hash }) => [label, lectureHome + hash])),
			`${name}: unexpected lecture menu links`);
		await button.press('Escape');
		await submenu.waitFor({ state: 'hidden' });
		check(await button.getAttribute('aria-expanded') === 'false', `${name}: Escape did not close lecture submenu`);

		await button.click();
		await submenu.getByRole('link', { name: slot.label, exact: true }).click();
		await page.waitForURL((url) => url.pathname === lectureHome && url.hash === slot.hash);
		await submenu.waitFor({ state: 'hidden' });
		if (mobile) check(await toggle.getAttribute('aria-expanded') === 'false', `${name}: drawer remained open after ${slot.label}`);
		await checkLectureState(page, slot, name);
	}

	const practice = lectureSlots[2];
	const switcher = crumbs.locator('.site-bc-switch');
	await switcher.click();
	const siblingMenu = crumbs.getByRole('menu');
	await siblingMenu.waitFor();
	const menuBox = await siblingMenu.boundingBox();
	check(menuBox.x >= 0 && menuBox.x + menuBox.width <= page.viewportSize().width + 1,
		`${name}: breadcrumb switcher extends past the viewport`);
	await siblingMenu.getByRole('menuitem', { name: practice.label, exact: true }).click();
	await page.waitForURL((url) => url.pathname === lectureHome && url.hash === practice.hash);
	await checkLectureState(page, practice, name);

	const lectureCrumb = crumbs.getByRole('link', { name: '강연·자료', exact: true });
	check(await lectureCrumb.getAttribute('href') === lectureHome, `${name}: wrong lecture breadcrumb link`);
	await lectureCrumb.click();
	await page.waitForURL((url) => url.pathname === lectureHome && !url.hash);
	await checkLectureState(page, lectureSlots[0], name);

	const homeCrumb = crumbs.getByRole('link', { name: '홈', exact: true });
	check(await homeCrumb.getAttribute('href') === '/', `${name}: wrong home breadcrumb link`);
	await homeCrumb.click();
	await page.waitForURL(new URL('/', base).href);
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

				if (mobile) {
					await openPage(page, base + articlePath);
					const paragraph = page.locator('.blog-post-prose p').first();
					check(await fontSize(page.locator('body')) === '16px' && await fontSize(paragraph) === '16px',
						`${name}: article body and paragraph must be 16px`);
					if (width === 320) await checkDrawer(page, `${name} article`);
				}
				results.push({ name, posts, lectureLinks: lectureSlots.length });
			}
			if (!resources) resources = await checkResources(page, base);
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
		themeChanges,
		...resources,
		failures,
	}, null, 2));
	if (failures.length) process.exitCode = 1;
}

run().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
