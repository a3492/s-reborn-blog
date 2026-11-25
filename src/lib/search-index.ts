import { getCollection, type CollectionEntry } from 'astro:content';
import { publicTags, searchableTags } from '../data/tag-aliases';
import { LEVELS, cellOf, formatOf, levelOf, taxonomyLinkForCell } from '../data/taxonomy';

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
	legacyCategory: string;
	tags: string;
	difficulty: string;
	type: string;
	subcategory: string;
	url: string;
	_difficulty: string;
	_tags: string[];
};

export function toSearchIndexEntry(post: CollectionEntry<'blog'>, isEn = false): SearchIndexEntry {
	const cell = cellOf(post);
	const level = levelOf(post);
	return {
		id: post.id,
		title: isEn ? (post.data.title_en ?? post.data.title) : post.data.title,
		description: isEn ? (post.data.description_en ?? post.data.description) : post.data.description,
		category: taxonomyLinkForCell(cell, isEn)?.label ?? '',
		legacyCategory: post.data.category ?? '',
		tags: searchableTags(post.data.tags),
		difficulty: level ? LEVELS[level] : '',
		type: formatOf(post),
		subcategory: post.data.subcategory ?? '',
		url: `${isEn ? '/en' : ''}/blog/${post.id}/`,
		_difficulty: level ?? '',
		_tags: publicTags(post.data.tags),
	};
}

export async function buildSearchIndex(isEn = false): Promise<SearchIndexEntry[]> {
	const allPosts = (await getCollection('blog', ({ data }) => !data.draft))
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
	return allPosts.map((post) => toSearchIndexEntry(post, isEn));
}
