import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		title_en: z.string().optional(),
		description: z.string(),
		description_en: z.string().optional(),
		date: z.coerce.date(),
		category: z.string().optional(),
		subcategory: z.string().optional(),
		tags: z.array(z.string()).optional().default([]),
		thumbnail: z.string().optional(),
		draft: z.boolean().optional().default(false),
		read_time: z.number().optional(),
		difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
		type: z.string().optional(),
		series: z.string().optional(),
		series_order: z.number().optional(),
		/** 정적 HTML에서 옮긴 초안. 본문 보강 전임을 표시한다. */
		needsExpansion: z.boolean().optional().default(false),
	}),
});

const research = defineCollection({
	loader: glob({ base: './src/content/research', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		documentId: z.string(),
		title: z.string(),
		description: z.string(),
		researchArea: z.enum(['multi-ai', 'human-ai', 'workflow']),
		parentId: z.string().nullable(),
		relatedIds: z.array(z.string()).default([]),
		slug: z.string(),
		status: z.enum(['draft', 'in-review', 'published']),
		order: z.number().default(0),
		version: z.string().default('0.1'),
		publishedAt: z.coerce.date().nullable().optional(),
		updatedAt: z.coerce.date(),
	}),
});

export const collections = { blog, research };
