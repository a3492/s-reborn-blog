// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Canonical public origin. The Pages project hostname
// https://s-reborn-blog.pages.dev stays as the default *.pages.dev URL.
// Attach sreborn.net in the Pages dashboard before this origin is live.
// See docs/custom-domain-sreborn-net.md.
export default defineConfig({
	site: 'https://sreborn.net',
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => {
				let path = page;
				try {
					path = new URL(page).pathname;
				} catch {
					return false;
				}
				if (path === '/admin' || path.startsWith('/admin/')) return false;
				if (path === '/docs' || path.startsWith('/docs/')) return false;
				if (path === '/en' || path.startsWith('/en/')) return false;
				if (path === '/404' || path === '/404.html') return false;
				return true;
			},
		}),
	],
});
