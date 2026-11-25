import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { cellOf, taxonomyLinkForCell } from '../data/taxonomy';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getPublicSiteSettings } from '../lib/site-settings';

export async function GET(context) {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	const settings = await getPublicSiteSettings();
	return rss({
		title: settings.siteTitle || SITE_TITLE,
		description: settings.siteDescription || SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => {
			const category = taxonomyLinkForCell(cellOf(post));
			return {				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.date,
				link: `/blog/${post.id}/`,
				categories: category ? [category.label] : undefined,
			};
		}),
	});
}
