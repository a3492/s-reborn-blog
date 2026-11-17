/**
 * 포털 시범에서 새로 만든 화면 문구.
 * en·zh는 자리만 둔다. 번역은 하지 않는다.
 * 기존 화면의 문장은 각 페이지에 그대로 둔다.
 */
const ko = {
	searchLabel: '글 검색',
	searchPlaceholder: '의도로 검색 — 입문, 비용, 법적 책임...',
	searchSubmit: '검색',
	mobileSearch: '검색 열기',
	categoryTitle: '분류별 글',
	categoryLead: '분류를 누르면 해당 글 목록이 열립니다.',
	latestTitle: '최신 글',
	latestLead: '최근에 올라온 글입니다.',
	shortcutTitle: '바로가기',
	shortcutLead: '강연, 아카데미, 실습 라이브러리로 이동합니다.',
	lectureGroup: '강연',
	academyGroup: '아카데미',
	crmGroup: 'CRM AI 실습 라이브러리',
	otherGroup: '기타',
	crmGuide: '페인 포인트 이해하기',
	countUnit: '개',
} as const;

export type PortalCopy = { [K in keyof typeof ko]: string };

function blankCopy(): PortalCopy {
	return Object.fromEntries(Object.keys(ko).map((key) => [key, ''])) as PortalCopy;
}

export const ui = {
	ko,
	en: blankCopy(),
	zh: blankCopy(),
};

export function portalCopy(lang: keyof typeof ui = 'ko'): PortalCopy {
	return ui[lang];
}
