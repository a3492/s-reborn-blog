import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { archiveMarkdown } from '../../lib/tool-archives';

export async function getStaticPaths() {
	const archives = await getCollection('toolArchives', ({ data }) => !data.draft);
	return archives.map((entry) => ({ params: { slug: entry.id } }));
}

export const GET: APIRoute = async ({ params }) => {
	const slug = params.slug;
	if (!slug) return new Response('Not found', { status: 404 });
	const archives = await getCollection('toolArchives', ({ data }) => !data.draft);
	const entry = archives.find((archive) => archive.id === slug);
	if (!entry) return new Response('Not found', { status: 404 });
	return new Response(archiveMarkdown(entry.data), {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `attachment; filename="${slug}.md"`,
		},
	});
};
