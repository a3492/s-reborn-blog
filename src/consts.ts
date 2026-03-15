export const SITE_TITLE = 'S-Reborn World';
export const SITE_DESCRIPTION = 'AI of the people, by the people, for the people';

export const CATEGORIES = [
	{ id: 'ai',      label: 'AI',    icon: '🤖' },
	{ id: 'medicine', label: '의학', icon: '🏥' },
	{ id: '학습',    label: '학습',  icon: '📚' },
	{ id: 'dev',     label: '개발',  icon: '💻' },
	{ id: '에세이',  label: '에세이', icon: '✍️' },
] as const;

// 카테고리 추가: CATEGORIES 배열에 항목 추가 후 Obsidian _BLOG/ 폴더에 동일 이름 폴더 생성
// 하위 카테고리: frontmatter의 subcategory 필드 사용 (자유 문자열)
