import type { CollectionEntry } from 'astro:content';

export type ToolArchive = CollectionEntry<'toolArchives'>;
export type ToolArchiveData = ToolArchive['data'];
export type ToolArchiveItem = ToolArchiveData['items'][number];

export const AWAITING_SOURCE = '원문 입력 대기';

export const TOOL_TOPICS = [
	{
		id: 'hospital-data',
		label: '병원 데이터',
		note: 'CRM, 지표, 개인정보처럼 병원 데이터를 AI에 넣기 전에 보는 자료.',
	},
	{
		id: 'opening',
		label: '개원 준비',
		note: '개원 준비 자료는 같은 아카이브 형식으로 이어 올립니다.',
	},
	{
		id: 'operations',
		label: '운영',
		note: '운영 자료는 같은 아카이브 형식으로 이어 올립니다.',
	},
] as const;

export type ToolTopicId = (typeof TOOL_TOPICS)[number]['id'];

export function topicLabel(topic: ToolTopicId): string {
	return TOOL_TOPICS.find((entry) => entry.id === topic)?.label ?? topic;
}

function itemBody(item: ToolArchiveItem): { question: string; resolution: string; lectureLine: string } {
	if (item.bodyStatus === 'awaiting-source') {
		return {
			question: AWAITING_SOURCE,
			resolution: AWAITING_SOURCE,
			lectureLine: AWAITING_SOURCE,
		};
	}
	return {
		question: item.question,
		resolution: item.resolution,
		lectureLine: item.lectureLine,
	};
}

export function itemCopyText(archive: ToolArchiveData, item: ToolArchiveItem): string {
	const body = itemBody(item);
	const lines = [
		`# ${item.code}. ${item.title}`,
		'',
		`출처: ${archive.sourceTitle}`,
		`인덱스 표기: ${item.indexLabel}`,
		'',
		'## 인덱스 원문',
		`핵심 질문: ${body.question}`,
		`해결: ${body.resolution}`,
		'',
		'## 강연 원고 한 줄',
		body.lectureLine,
	];
	if (item.bodyStatus === 'source' && item.demoInLecture) {
		lines.push('강연 원고 표시: 시연');
	}
	lines.push('', '## 내 AI에 넣는 법', archive.howTo, '');
	return lines.join('\n');
}

export function archiveMarkdown(archive: ToolArchiveData): string {
	const sourceLines = archive.sources.map((source) => `- ${source.label}: ${source.url} — ${source.note}`);
	const itemBlocks = archive.items.map((item) => itemCopyText(archive, item).trimEnd());
	return [
		`# ${archive.title}`,
		'',
		archive.summary,
		'',
		`- 행사: ${archive.eventLabel}`,
		`- 대상: ${archive.audience}`,
		`- 원문 제목: ${archive.sourceTitle}`,
		'',
		'## 핵심 메시지',
		'',
		archive.coreMessage,
		'',
		'## 내 AI에 넣는 법',
		'',
		archive.howTo,
		'',
		'## 항목',
		'',
		itemBlocks.join('\n\n---\n\n'),
		'',
		'## 결론',
		'',
		archive.closing,
		'',
		'## 제작 유의',
		'',
		archive.caution,
		'',
		'## 출처',
		'',
		...sourceLines,
		'',
	].join('\n');
}

export function archivePlainText(archive: ToolArchiveData): string {
	return archiveMarkdown(archive)
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/\n---\n/g, '\n\n');
}
