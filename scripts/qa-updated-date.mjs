import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Build the real templates in a temporary copy with fixture articles. The published collection is untouched.
const root = fileURLToPath(new URL('../', import.meta.url));
const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'sreborn-update-qa-'));
try {
	const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
	const dirs = new Set(files.map((file) => path.dirname(file)));
	await Promise.all([...dirs].map((dir) => mkdir(path.join(fixtureRoot, dir), { recursive: true })));
	for (const file of files) await copyFile(path.join(root, file), path.join(fixtureRoot, file));
	await symlink(path.join(root, 'node_modules'), path.join(fixtureRoot, 'node_modules'), 'junction');

	// A starter revised in the fixture must also appear in the independently ranked latest list.
	const starterFile = path.join(fixtureRoot, 'src/content/blog/aerini/what-is-ai.md');
	const starterSource = await readFile(starterFile, 'utf8');
	await writeFile(starterFile, starterSource.replace(/^---\r?\n/, '---\nupdatedDate: "2099-04-01"\n'));

	const samples = [
		{ id: 'qa-date-revised', date: '2020-01-01', updatedDate: '2099-04-03' },
		{ id: 'qa-date-published', date: '2099-04-02' },
		{ id: 'qa-date-draft', date: '2099-04-04', draft: true },
	];
	for (const { id, date, updatedDate, draft } of samples) {
		const metadata = [
			'---', `title: "${id}"`, 'description: "Temporary date QA article"',
			`date: "${date}"`, 'category: ai', 'topic: basics',
			...(updatedDate ? [`updatedDate: "${updatedDate}"`] : []), ...(draft ? ['draft: true'] : []),
			'---', '', 'Synthetic article for the isolated QA build.', '',
		].join('\n');
		await writeFile(path.join(fixtureRoot, 'src/content/blog', id + '.md'), metadata);
	}
	execFileSync(process.execPath, [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build'], {
		cwd: fixtureRoot, stdio: 'pipe', maxBuffer: 8 * 1024 * 1024,
	});

	const built = (file) => readFile(path.join(fixtureRoot, 'dist', file), 'utf8');
	const [home, revised, published, sitemap, rss, english] = await Promise.all([
		'index.html', 'blog/qa-date-revised/index.html', 'blog/qa-date-published/index.html',
		'sitemap-0.xml', 'rss.xml', 'en/blog/qa-date-revised/index.html',
	].map(built));
	const section = (id) => home.match(new RegExp(`<section[^>]*id="${id}"[^>]*>([\\s\\S]*?)</section>`))[1];
	const rows = [...section('latest').matchAll(/<li class="portal-row portal-row-post">([\s\S]*?)<\/li>/g)].map((match) => match[1]);
	assert.match(rows[0], /href="\/blog\/qa-date-revised\/"/);
	assert.match(rows[0], /업데이트 2099\.04\.03/);
	assert.match(rows[1], /href="\/blog\/qa-date-published\/"/);
	assert.doesNotMatch(rows[1], /업데이트/);
	assert.match(rows[2], /href="\/blog\/aerini\/what-is-ai\/"/);
	assert.match(rows[2], /업데이트 2099\.04\.01/);
	assert.match(section('home-starter'), /href="\/blog\/aerini\/what-is-ai\/"/);
	assert.ok(rows.every((row) => !row.includes('qa-date-draft')));

	const schema = (html) => JSON.parse(html.match(/<script[^>]*id="article-json-ld"[^>]*>(.*?)<\/script>/)[1]);
	assert.equal(schema(revised).datePublished, '2020-01-01T00:00:00.000Z');
	assert.equal(schema(revised).dateModified, '2099-04-03T00:00:00.000Z');
	assert.equal(schema(published).dateModified, undefined);
	assert.match(revised, /<time datetime="2020-01-01T00:00:00\.000Z">[^<]+<\/time>\s*<time datetime="2099-04-03T00:00:00\.000Z">업데이트 2099\.04\.03<\/time>/);
	assert.doesNotMatch(published, /<time[^>]+>업데이트/);
	assert.match(english, /Updated 2099\.04\.03/);

	const revisedUrl = sitemap.match(/<url><loc>[^<]*\/blog\/qa-date-revised\/<\/loc>(.*?)<\/url>/)[1];
	assert.match(revisedUrl, /<lastmod>2099-04-03T00:00:00\.000Z<\/lastmod>/);
	const publishedUrl = sitemap.match(/<url><loc>[^<]*\/blog\/qa-date-published\/<\/loc>(.*?)<\/url>/)[1];
	assert.doesNotMatch(publishedUrl, /<lastmod>/);
	const rssItem = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].find((match) => match[1].includes('/blog/qa-date-revised/'))[1];
	assert.equal(new Date(rssItem.match(/<pubDate>(.*?)<\/pubDate>/)[1]).toISOString(), '2020-01-01T00:00:00.000Z');
	console.log('Updated-date fixtures passed: home order and labels, starter overlap, KO/EN article dates, JSON-LD, sitemap, and RSS.');
} finally {
	await rm(fixtureRoot, { recursive: true, force: true });
}
