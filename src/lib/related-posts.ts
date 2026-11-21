import type { CollectionEntry } from 'astro:content';
import { publicTags } from '../data/tag-aliases';
import { cellOf } from '../data/taxonomy';

export function relatedPosts(posts: CollectionEntry<'blog'>[], articleId: string) {
	const tagged = posts.map((post) => ({ post, tags: publicTags(post.data.tags) }));
	const current = tagged.find(({ post }) => post.id === articleId);
	if (!current?.tags.length) return [];

	const frequency = new Map<string, number>();
	for (const { tags } of tagged) {
		for (const tag of tags) frequency.set(tag, (frequency.get(tag) ?? 0) + 1);
	}
	const weights = new Map(current.tags.map((tag) => {
		const occurrences = frequency.get(tag) ?? 0;
		return [tag, occurrences > 1 ? 1 / Math.log2(occurrences) : 0];
	}));
	const cell = cellOf(current.post);
	return tagged
		.filter(({ post }) => post.id !== articleId)
		.map(({ post, tags }) => ({
			post,
			score: tags.reduce((sum, tag) => sum + (weights.get(tag) ?? 0), 0),
			sameCell: Number(cellOf(post) === cell),
		}))
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score || b.sameCell - a.sameCell || +b.post.data.date - +a.post.data.date ||
			a.post.id.localeCompare(b.post.id))
		.slice(0, 3)
		.map(({ post }) => post);
}
