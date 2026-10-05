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
	integrations: [mdx(), sitemap()],
});
