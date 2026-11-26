// @ts-check

import { readFile } from 'node:fs/promises';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

/** @type {URL} */
let builtSite;
const translatedIds = new Set(Object.keys(JSON.parse(await readFile(new URL('./src/data/blog-translations-en.json', import.meta.url),'utf8'))));

// Canonical public origin. The Pages project hostname
// https://s-reborn-blog.pages.dev stays as the default *.pages.dev URL.
// Attach sreborn.net in the Pages dashboard before this origin is live.
// See docs/custom-domain-sreborn-net.md.
export default defineConfig({
	site: 'https://sreborn.net',
	integrations: [
		mdx(),
		{
			name: 'sitemap-article-dates',
			hooks: { 'astro:build:done': ({ dir }) => { builtSite = dir; } },
		},
		sitemap({
			serialize: async (item) => {
				const path = new URL(item.url).pathname;
				if (path === '/blog/' || !path.startsWith('/blog/') || path.startsWith('/blog/topics/')) return item;

				// Read only the explicit revision date emitted in the built article.
				const file = new URL(`.${path.replace(/\/$/, '')}/index.html`, builtSite);
				const html = await readFile(file, 'utf8');
				if (html.includes('<meta name="robots" content="noindex"')) return undefined;
				const modifiedTime = html.match(/<meta property="article:modified_time" content="([^"]+)"/)?.[1];
				return modifiedTime ? { ...item, lastmod: modifiedTime } : item;
			},
			filter: (page) => {
				let path = page;
				try {
					path = new URL(page).pathname;
				} catch {
					return false;
				}
				if (path === '/admin' || path.startsWith('/admin/')) return false;
				if (path === '/docs' || path.startsWith('/docs/')) return false;
				if ((path === '/en' || path.startsWith('/en/')) && !/^\/en\/technology\/?$/.test(path) && !translatedIds.has(path.replace(/^\/en\/blog\//,'').replace(/\/$/,''))) return false;
				if (path === '/404' || path === '/404.html') return false;
				if (path === '/preview' || path.startsWith('/preview/')) return false;
				if (path === '/coming-soon' || path.startsWith('/coming-soon/')) return false;
				return true;
			},
		}),
	],
});
