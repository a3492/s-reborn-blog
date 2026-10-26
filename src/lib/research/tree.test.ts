import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	type ResearchDocument,
	ResearchTreeError,
	flatten,
	publicPages,
	publicTree,
	validateAndBuild,
} from './tree.ts';
import { sampleDocuments } from './fixtures/sample.ts';

function doc(partial: Partial<ResearchDocument> & Pick<ResearchDocument, 'documentId' | 'slug' | 'researchArea'>): ResearchDocument {
	return {
		title: partial.title ?? partial.documentId,
		description: partial.description ?? '',
		parentId: partial.parentId ?? null,
		relatedIds: partial.relatedIds ?? [],
		status: partial.status ?? 'published',
		order: partial.order ?? 0,
		version: partial.version ?? '0.1',
		publishedAt: partial.publishedAt ?? '2026-10-27',
		updatedAt: partial.updatedAt ?? '2026-10-27',
		...partial,
	};
}

const roots: ResearchDocument[] = [
	doc({ documentId: 'maos-root', slug: 'multi-ai', researchArea: 'multi-ai', order: 1 }),
	doc({ documentId: 'haci-root', slug: 'human-ai', researchArea: 'human-ai', order: 2 }),
	doc({ documentId: 'awe-root', slug: 'workflow', researchArea: 'workflow', order: 3 }),
];

test('builds three roots without a depth cap', () => {
	let parent = 'maos-root';
	const extra: ResearchDocument[] = [];
	for (let i = 1; i <= 8; i += 1) {
		const id = `maos-d${i}`;
		extra.push(doc({ documentId: id, slug: `layer-${i}`, researchArea: 'multi-ai', parentId: parent, order: i }));
		parent = id;
	}
	const { roots: tree, byPath } = validateAndBuild([...roots, ...extra]);
	assert.equal(tree.length, 3);
	assert.equal(byPath.get('/research/multi-ai/layer-1/layer-2/layer-3/layer-4/layer-5/layer-6/layer-7/layer-8/')?.depth, 8);
});

test('rejects cycles', () => {
	assert.throws(
		() =>
			validateAndBuild([
				...roots,
				doc({ documentId: 'a', slug: 'a', researchArea: 'multi-ai', parentId: 'b' }),
				doc({ documentId: 'b', slug: 'b', researchArea: 'multi-ai', parentId: 'a' }),
			]),
		(err: unknown) => err instanceof ResearchTreeError && err.code === 'cycle',
	);
});

test('rejects missing parents', () => {
	assert.throws(
		() =>
			validateAndBuild([
				...roots,
				doc({ documentId: 'orphan', slug: 'orphan', researchArea: 'multi-ai', parentId: 'no-such' }),
			]),
		(err: unknown) => err instanceof ResearchTreeError && err.code === 'missing-parent',
	);
});

test('rejects duplicate sibling slugs', () => {
	assert.throws(
		() =>
			validateAndBuild([
				...roots,
				doc({ documentId: 'one', slug: 'same', researchArea: 'multi-ai', parentId: 'maos-root' }),
				doc({ documentId: 'two', slug: 'same', researchArea: 'multi-ai', parentId: 'maos-root' }),
			]),
		(err: unknown) => err instanceof ResearchTreeError && err.code === 'duplicate-slug',
	);
});

test('unpublished nodes and descendants are omitted from the public tree', () => {
	const { roots: tree } = validateAndBuild([
		...roots,
		doc({
			documentId: 'draft',
			slug: 'ops-rules',
			researchArea: 'multi-ai',
			parentId: 'maos-root',
			status: 'draft',
			title: '운영 규칙 초안',
		}),
		doc({
			documentId: 'child-of-draft',
			slug: 'secret',
			researchArea: 'multi-ai',
			parentId: 'draft',
			status: 'published',
			title: 'Should not publish',
		}),
	]);
	const visible = flatten(publicTree(tree));
	assert.equal(visible.some((node) => node.documentId === 'draft'), false);
	assert.equal(visible.some((node) => node.documentId === 'child-of-draft'), false);
	assert.equal(publicPages(tree).some((node) => node.documentId === 'child-of-draft'), false);
	assert.equal(publicPages(tree).every((node) => node.bodyPublic), true);
});

test('fixture sample publishes one document and hides the unpublished one', () => {
	const { roots: tree } = validateAndBuild(sampleDocuments);
	const pages = publicPages(tree);
	assert.equal(pages.length, 1);
	assert.equal(pages[0]?.documentId, 'sample-published');
	const visibleTitles = flatten(publicTree(tree)).map((node) => node.title);
	assert.deepEqual(visibleTitles, ['샘플 공개 문서']);
	assert.equal(visibleTitles.includes('샘플 비공개 문서'), false);
});
