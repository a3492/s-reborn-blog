import { readFileSync } from 'node:fs';

export const TOPICS = [
	{ id: 'basics', label: 'AI 이해', labelEn: 'Understanding AI', description: 'AI 모델의 작동 원리부터 핵심 용어와 역사까지 살펴봅니다.', featured: ['aerini/what-is-ai'] },
	{ id: 'prompting', label: '프롬프트·컨텍스트', labelEn: 'Prompts & context', description: 'AI에 질문을 설계하고, 작업에 필요한 맥락과 자료를 전달하는 방법을 다룹니다.', featured: ['prompt-engineering/zero-shot-vs-few-shot'] },
	{ id: 'building', label: '에이전트·개발', labelEn: 'Agents & development', description: '에이전트, 오케스트레이션, 하네스, RAG와 API로 AI 시스템을 만드는 방법을 다룹니다.', featured: ['orchestration/react-pattern'] },
	{ id: 'clinic', label: '진료·업무', labelEn: 'Clinical work', description: '진료 기록, 환자 설명, 회진과 병원 업무에 AI를 적용하는 글입니다.', featured: ['aerini/ai-discharge-summary'] },
	{ id: 'research', label: '연구·학술', labelEn: 'Research & scholarship', description: '논문, 통계, 데이터 분석과 학술 발표에 AI를 활용하는 방법을 다룹니다.', featured: ['medical-data-science/survival-analysis-basics'] },
	{ id: 'tools', label: '도구·리뷰', labelEn: 'Tools & reviews', description: 'AI 도구를 비교하고, 설치와 비용을 살펴보고, 실제 사용 사례를 읽습니다.', featured: ['ai-tools-general/gamma-ai-presentation'] },
	{ id: 'society', label: 'AI와 사회', labelEn: 'AI & society', description: 'AI 윤리, 편향, 개인정보, 법과 규제, 의료 AI 산업 동향을 살펴봅니다.', featured: ['regulations/korean-medical-law-ai'] },
] as const;

export type Topic = typeof TOPICS[number]['id'];
export const TOPIC_IDS = TOPICS.map(({ id }) => id) as [Topic, ...Topic[]];
export const topicHref = (id: Topic) => `/blog/topics/${id}/`;
export const FORMAT = ['개념', '용어·어원', '역사', 'FAQ', '따라하기', '리뷰·사용기', '뉴스', '가이드'] as const;
export type PostFormat = typeof FORMAT[number];
export const LEVELS = { beginner: '입문', intermediate: '중급', advanced: '심화' } as const;
type Level = keyof typeof LEVELS;
export const ACADEMY_CELLS = ['ACADEMY:course', 'ACADEMY:practice', 'ACADEMY:talks'] as const;
type AcademyCell = typeof ACADEMY_CELLS[number];

export const CATEGORY_TO_TOPIC: Partial<Record<string, Topic>> = {
	aerini: 'basics', ai: 'basics', 'ai-terminology': 'basics', 'ai-history': 'basics',
	'prompt-engineering': 'prompting', 'context-engineering': 'prompting',
	'harness-engineering': 'building', 'ai-agents': 'building', 'rag-finetuning': 'building',
	orchestration: 'building', 'doctor-dev': 'building', 'medical-data-science': 'research',
	'clinical-research': 'research', regulations: 'society', 'ai-news': 'society',
	faq: 'tools', tips: 'clinic', 'ai-tools-medical': 'tools', 'ai-tools-general': 'tools',
};

export const ACADEMY_COURSE = [
	{ id: 'trust', label: '신뢰·안전', ids: [
		'ai-vs-human-doctor', 'ai-hallucination-medical', 'ai-hallucination-prevention', 'ai-bias-healthcare',
		'ai-explainability', 'ai-reliability-metrics', 'medical-ai-data-sources', 'ai-model-updates-risk',
		'ai-ethics-healthcare', 'medical-ai-regulation',
	] },
	{ id: 'tools', label: '도구', ids: [
		'clinical-note-transcription', 'drug-interaction-ai', 'medical-imaging-ai', 'icd-coding-ai', 'clinical-trial-matching-ai',
	] },
	{ id: 'prompts', label: '프롬프트', ids: [
		'diagnostic-report-prompt', 'discharge-plan-prompt', 'prescription-review-prompt',
		'injection-instructions-prompt', 'health-screening-prompt',
	] },
	{ id: 'cases', label: '케이스', ids: [
		'acute-abdominal-pain-case', 'diabetes-management-ai', 'fever-differential-diagnosis',
		'polypharmacy-review-ai', 'multidisciplinary-ai',
	] },
] as const;

type MappingRow = { path: string; old: string; cell: string; format: string; level: string };
const mappingCsv = readFileSync('docs/plans/taxonomy-v2-mapping.csv', 'utf8');
const [header, ...lines] = mappingCsv.trimEnd().split(/\r?\n/);
if (header !== 'path,old,new,format,level,title') throw new Error('Unexpected taxonomy CSV header');
export const MAPPING_ROWS: MappingRow[] = lines.map((line, index) => {
	// The first five fields are unquoted identifiers or labels. The remaining field is the title.
	const fields = /^([^,"]+),([^,"]+),([^,"]+),([^,"]+),([^,"]+),.+$/.exec(line);
	if (!fields) throw new Error(`Invalid taxonomy CSV row ${index + 2}`);
	const [, path, old, cell, format, level] = fields;
	return { path, old, cell, format, level };
});

export const postIdFromPath = (path: string) => path.replace(/\.(md|mdx)$/, '');
const mapping = new Map(MAPPING_ROWS.map((row) => [postIdFromPath(row.path), row]));
export function isTopic(value: string | undefined): value is Topic {
	return TOPICS.some(({ id }) => id === value);
}

export const TOPIC_OVERRIDES = new Map(MAPPING_ROWS.flatMap(({ path, old, cell }) =>
	cell !== CATEGORY_TO_TOPIC[old] && cell !== 'ACADEMY:course'
		? [[postIdFromPath(path), cell] as const] : [],
));

export type TaxonomyPost = {
	id: string;
	data: { category?: string; topic?: Topic; format?: PostFormat; difficulty?: Level; type?: string };
};

export function cellOf(post: TaxonomyPost): string | undefined {
	if (post.data.category === 'doctor-ai') return 'ACADEMY:course';
	return post.data.topic ?? TOPIC_OVERRIDES.get(post.id) ?? CATEGORY_TO_TOPIC[post.data.category ?? ''];
}

export function topicOf(post: TaxonomyPost): Topic | undefined {
	const cell = cellOf(post);
	return isTopic(cell) ? cell : undefined;
}

export const academyLabel = (cell: string | undefined) => ({
	'ACADEMY:course': '강의',
	'ACADEMY:practice': '실습',
	'ACADEMY:talks': '발표·기록',
} as const)[cell as AcademyCell];

export function formatOf(post: TaxonomyPost): string {
	const inferred = ({ 'ai-terminology': '용어·어원', 'ai-history': '역사', faq: 'FAQ',
		tips: '따라하기', 'ai-news': '뉴스', 'ai-tools-medical': '리뷰·사용기', 'ai-tools-general': '리뷰·사용기',
	} as Record<string, PostFormat>)[post.data.category ?? ''];
	return post.data.format ?? mapping.get(post.id)?.format ?? inferred ?? '가이드';
}

export function levelOf(post: TaxonomyPost): Level | undefined {
	const approved = mapping.get(post.id)?.level;
	return approved
		? (Object.keys(LEVELS) as Level[]).find((level) => LEVELS[level] === approved)
		: post.data.difficulty;
}
