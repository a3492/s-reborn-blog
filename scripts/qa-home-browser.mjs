/**
 * Browser checks for the title-only home and the lecture breadcrumb.
 * Serves dist/ unless QA_BASE_URL is set. Uses system Chrome when present.
 *
 *   npm run build && npm run qa:home-browser
 */
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const shots = process.env.QA_SHOTS || '';
const widths = [320, 360, 390, 768, 1280];
const themes = ['light', 'dark', 'system'];
const lectureSlots = [
	['강연·자료 홈', '/lecture-materials/'],
	['자료', '/lecture-materials/#materials'],
	['실습', '/lecture-materials/#practice'],
	['발표·기록', '/lecture-materials/#talks'],
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

function startStatic(directory) {
	return new Promise((resolve) => {
		const server = createServer(async (req, res) => {
			try {
				const url = new URL(req.url || '/', 'http://127.0.0.1');
				let file = decodeURIComponent(url.pathname);
				if (file.endsWith('/')) file += 'index.html';
				const full = path.join(directory, file);
				if (!full.startsWith(directory)) {
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

async function fontSize(page) {
	return page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
}

async function openLectureMenu(page, width) {
	if (width < 1201) {
		const toggle = page.locator('[data-nav-toggle]');
		if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
		await page.locator('header.site-header.is-open').waitFor();
	}
	const button = page.getByRole('button', { name: '강연·자료', exact: true });
	if ((await button.getAttribute('aria-expanded')) !== 'true') await button.click();
	await page.locator('.site-nav-item.is-open .site-nav-sub').waitFor();
}

async function run() {
	if (!process.env.QA_BASE_URL && !existsSync(path.join(dist, 'index.html'))) {
		console.error('dist/index.html is missing. Run npm run build first.');
		process.exit(1);
	}
	let server;
	let base = process.env.QA_BASE_URL;
	if (!base) {
		const started = await startStatic(dist);
		server = started.server;
		base = started.base;
	}
	const executablePath = chromePath();
	const browser = await chromium.launch({
		executablePath,
		args: ['--no-sandbox', '--disable-dev-shm-usage'],
	});
	const results = [];
	try {
		for (const theme of themes) {
			for (const scheme of theme === 'system' ? ['light', 'dark'] : [theme]) {
				const context = await browser.newContext({
					viewport: { width: 1280, height: 900 },
					deviceScaleFactor: 1,
					colorScheme: scheme,
				});
				await context.addInitScript((mode) => {
					localStorage.setItem('sreborn-theme', mode);
				}, theme);
				const page = await context.newPage();
				for (const width of widths) {
					await page.setViewportSize({ width, height: width >= 768 ? 900 : 780 });
					await page.goto(`${base}/`, { waitUntil: 'networkidle' });
					const resolved = await page.evaluate(() => document.documentElement.dataset.theme);
					const expected = theme === 'system' ? scheme : theme;
					check(resolved === expected, `${theme}/${scheme} @${width} resolved ${resolved}`);
					check((await page.locator('#explore .cards > a.card').count()) === 0, `home cards still present @${width}`);
					const posts = page.locator('#latest .portal-row-post');
					const postCount = await posts.count();
					check(postCount >= 1, `latest posts missing @${width}`);
					if (postCount) {
						const sample = posts.first();
						check((await sample.locator('.portal-title').count()) === 1, `post title missing @${width}`);
						const meta = (await sample.locator('.portal-meta').innerText()).replace(/\s+/g, ' ').trim();
						check(meta.includes('·'), `category/date meta missing @${width}: ${meta}`);
						check((await sample.locator('time').count()) === 1, `date missing @${width}`);
					}
					check((await page.locator('.portal-summary, .portal-copy').count()) === 0, `summary leaked onto home @${width}`);
					check(await fontSize(page) === 16, `home body font @${width} ${await fontSize(page)}`);
					check((await page.locator('a[href*="open.kakao.com"]').count()) >= 1, `open chat missing @${width}`);

					if (width < 1201) {
						const toggle = page.locator('[data-nav-toggle]');
						const box = await toggle.boundingBox();
						check(Boolean(box) && box.x >= 0 && box.x + box.width <= width + 1, `menu button offscreen @${width}`);
						await toggle.click();
						await page.locator('header.site-header.is-open').waitFor();
						check((await toggle.getAttribute('aria-expanded')) === 'true', `menu did not open @${width} ${theme}`);
						const overlap = await page.evaluate(() => {
							const brand = document.querySelector('.site-brand-mark')?.getBoundingClientRect();
							const nav = document.querySelector('#site-nav')?.getBoundingClientRect();
							if (!brand || !nav) return 999;
							return brand.right - nav.left;
						});
						check(overlap <= 0.5, `drawer covers brand by ${overlap}px @${width} ${theme}/${scheme}`);
						if (shots && (width === 320 || width === 390) && theme !== 'system') {
							await page.screenshot({ path: path.join(shots, `menu-open-${width}-${theme}.png`) });
						}
						await page.locator('[data-nav-close]').click();
						check((await toggle.getAttribute('aria-expanded')) === 'false', `menu did not close @${width}`);
					}

					await page.goto(`${base}/lecture-materials/#practice`, { waitUntil: 'networkidle' });
					await page.waitForFunction(() => document.querySelector('[data-bc-current]')?.textContent?.includes('실습'));
					const hrefs = await page.locator('.site-bc-link').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
					check(hrefs[0] === '/' && hrefs[1] === '/lecture-materials/' && hrefs[2] === '/lecture-materials/#practice', `breadcrumb hrefs @${width}: ${hrefs.join(' ')}`);
					check((await page.locator('[data-bc-current]').getAttribute('aria-current')) === 'page', `breadcrumb current @${width}`);
					check((await page.locator('[data-nav-child="lectures-practice"]').getAttribute('aria-current')) === 'page', `submenu current @${width} ${theme}`);
					const json = await page.locator('#site-bc-ld').textContent();
					check(Boolean(json && json.includes('BreadcrumbList') && json.includes('실습')), `jsonld @${width}`);

					if (shots && width === 1280 && theme !== 'system') {
						await openLectureMenu(page, width);
						await page.screenshot({ path: path.join(shots, `menu-open-${width}-${theme}.png`) });
						await page.keyboard.press('Escape');
					}
					if (theme === 'light') {
						await openLectureMenu(page, width);
						const labels = (await page.locator('.site-nav-item.is-open .site-nav-sub a').allTextContents()).map((text) => text.replace(/\s+/g, ' ').trim());
						check(labels.join('|') === lectureSlots.map(([label]) => label).join('|'), `lecture slots @${width}: ${labels.join('|')}`);
						await page.keyboard.press('Escape');
						for (const [label, href] of lectureSlots) {
							await openLectureMenu(page, width);
							await page.locator('.site-nav-item.is-open .site-nav-sub').getByRole('link', { name: label, exact: true }).click();
							const target = new URL(href, base);
							await page.waitForURL((url) => url.pathname.replace(/\/$/, '') === target.pathname.replace(/\/$/, '') && url.hash === target.hash);
						}
						await page.locator('.site-bc-link', { hasText: '홈' }).click();
						await page.waitForURL((url) => url.pathname === '/');
						await page.goto(`${base}/lecture-materials/#practice`, { waitUntil: 'networkidle' });
						await page.locator('.site-bc-link', { hasText: '강연·자료' }).click();
						await page.waitForFunction(() => location.pathname.startsWith('/lecture-materials') && location.hash === '');
					}
					results.push(`${theme}/${scheme} ${width}`);
				}
				await page.setViewportSize({ width: 360, height: 780 });
				await page.goto(`${base}/blog/aerini/what-is-ai/`, { waitUntil: 'networkidle' });
				check(await fontSize(page) === 16, `post body 360 ${await fontSize(page)}`);
				await page.setViewportSize({ width: 720, height: 900 });
				await page.goto(`${base}/blog/aerini/what-is-ai/`, { waitUntil: 'networkidle' });
				check(await fontSize(page) === 16, `post body 720 ${await fontSize(page)}`);
				if (theme === 'light' && scheme === 'light') {
					await page.goto(`${base}/tutorials/crm-scenarios/`, { waitUntil: 'domcontentloaded' });
					const ids = await page.evaluate(() => new Set([...document.body.innerHTML.matchAll(/id="(PP\d{2}-\d{2})"/g)].map((match) => match[1])).size);
					check(ids >= 82, `crm scenario ids ${ids}`);
				}
				await context.close();
			}
		}
	} finally {
		await browser.close();
		if (server) await new Promise((resolve) => server.close(resolve));
	}
	if (failures.length) {
		console.error(failures.join('\n'));
		process.exit(1);
	}
	console.log(JSON.stringify({ ok: true, checked: results.length, failures: [] }, null, 2));
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
