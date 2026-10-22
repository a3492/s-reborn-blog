/**
 * 강연 매니페스트 (재사용 가능한 웹 강연 뷰어)
 *
 * 새 강연 추가 절차:
 *  1) public/lectures/<id>/slides.json (공개 데이터 — 발표자 노트 없음) 와 images/ 배치
 *     (내부 원본에서 `node scripts/build-lecture.mjs <id>` 로 생성)
 *  2) 아래 LECTURES 배열에 항목 추가
 *  → /lectures/<id>/ 경로에 뷰어가 자동 생성된다.
 *
 * 발표자 노트 등 내부 데이터는 공개 저장소/배포물에 포함하지 않는다.
 */
export interface Lecture {
	/** URL slug 겸 PEOS 자산 네임스페이스 (예: 'koat-ai-2026' → 자산 ID KOAT-S01..) */
	id: string;
	/** 강연명 */
	title: string;
	/** 상단 브랜드/부제 */
	subtitle?: string;
	brandLabel?: string;
	speaker?: string;
	org?: string;
	/** 표시용 일자 */
	date?: string;
	slideCount: number;
	description?: string;
	/** 제작 시스템 표기 */
	system?: string;
}

export const LECTURES: Lecture[] = [
	{
		id: 'koat-ai-2026',
		title: '왜 우리는 AI를 생각보다 잘 활용하지 못하는가?',
		subtitle: 'KOAT 2026 · AI OPEN LECTURE',
		brandLabel: 'KOAT',
		speaker: '김도위',
		org: '에스리본의원 홍대 대표원장 · 가정의학과 전문의',
		date: '2026. 10',
		slideCount: 26,
		description:
			'KOAT AI Open Lecture — 26장 웹 프레젠테이션. 우리가 왜 AI를 생각보다 잘 활용하지 못하는지, 무엇부터 바꿀 수 있는지 다룬다.',
		system: 'PEOS (Presentation Evolution Operating System)',
	},
];

export function getLecture(id: string): Lecture | undefined {
	return LECTURES.find((l) => l.id === id);
}
