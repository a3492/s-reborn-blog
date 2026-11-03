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

/**
 * 경영 도구 아카이브.
 * 병원 데이터, 개원 준비, 운영처럼 주제별 JSON을 추가하면 /tools/ 목록에 붙는다.
 * 연구 동기화(src/content/research)와 블로그 컬렉션과는 별도이다.
 */
const toolArchives = defineCollection({
	loader: glob({ base: './src/content/tool-archives', pattern: '**/*.json' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		topic: z.enum(['hospital-data', 'opening', 'operations']),
		order: z.number(),
		draft: z.boolean().optional().default(false),
		audience: z.string(),
		eventLabel: z.string(),
		sourceTitle: z.string(),
		coreMessage: z.string(),
		closing: z.string(),
		caution: z.string(),
		/** 페이지 안내 문구. 원문과 구분한다. */
		howTo: z.string(),
		sources: z.array(
			z.object({
				label: z.string(),
				url: z.string().url(),
				note: z.string(),
			}),
		),
		items: z.array(
			z.object({
				code: z.string(),
				title: z.string(),
				question: z.string(),
				resolution: z.string(),
				lectureLine: z.string(),
				demoInLecture: z.boolean(),
				detailUrl: z.string().url().optional(),
				/** source면 원문 필드가 채워져 있다. awaiting-source면 본문은 자리표시만 보여 준다. */
				bodyStatus: z.enum(['source', 'awaiting-source']),
			}),
		),
	}),
});

export const collections = { blog, toolArchives };
