import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * 블로그 글만 담는 검색 인덱스.
 * 홈과 Layout이 같은 결과를 쓰도록 필드와 정렬을 고정한다.
 * 강연·CRM·도구는 이 시범에서 넣지 않는다.
 */
export type SearchIndexEntry = {
	id: string;
	title: string;
	description: string;
	category: string;
	tags: string;
	difficulty: string;
	type: string;
	subcategory: string;
	url: string;
	_difficulty: string;
	_tags: string[];
};

export function toSearchIndexEntry(post: CollectionEntry<'blog'>): SearchIndexEntry {
	return {
		id: post.id,
		title: post.data.title,
		description: post.data.description ?? '',
		category: post.data.category ?? '',
		tags: (post.data.tags ?? []).join(' '),
		difficulty: post.data.difficulty ?? '',
		type: post.data.type ?? '',
		subcategory: post.data.subcategory ?? '',
		url: `/blog/${post.id}/`,
		_difficulty: post.data.difficulty ?? '',
		_tags: post.data.tags ?? [],
	};
}

export async function buildSearchIndex(): Promise<SearchIndexEntry[]> {
	const allPosts = (await getCollection('blog', ({ data }) => !data.draft))
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
	return allPosts.map(toSearchIndexEntry);
}
