import type { ResearchDocument } from '../tree.ts';

/** Token-free fixture: one published document, one unpublished document. */
export const sampleDocuments: ResearchDocument[] = [
	{
		documentId: 'sample-published',
		title: '샘플 공개 문서',
		description: '토큰 없이 공개 페이지가 만들어지는지 확인하는 샘플입니다.',
		researchArea: 'multi-ai',
		parentId: null,
		relatedIds: [],
		slug: 'multi-ai',
		status: 'published',
		order: 1,
		version: '0.1',
		publishedAt: '2026-10-27',
		updatedAt: '2026-10-27',
	},
	{
		documentId: 'sample-unpublished',
		title: '샘플 비공개 문서',
		description: 'Draft라서 페이지와 트리에 나오면 안 됩니다.',
		researchArea: 'multi-ai',
		parentId: 'sample-published',
		relatedIds: [],
		slug: 'hidden-draft',
		status: 'draft',
		order: 10,
		version: '0.1',
		publishedAt: null,
		updatedAt: '2026-10-27',
	},
];
