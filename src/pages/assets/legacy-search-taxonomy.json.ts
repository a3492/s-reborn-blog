import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import { cellOf, taxonomyLinkForCell } from '../../data/taxonomy';

export async function GET() {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	const labels = new Map(posts.map((post) => [`/blog/${post.id}/`, taxonomyLinkForCell(cellOf(post))?.label]));
	const entries = readFileSync('public/_redirects', 'utf8').split(/\r?\n/).flatMap((line) => {
		const [source, target] = line.trim().split(/\s+/);
		const slug = /^\/article\/([^/]+)\.html$/.exec(source)?.[1];
		const label = labels.get(target);
		return slug && label ? [[slug, label]] : [];
	});
	return Response.json(Object.fromEntries(entries));
}
