export const SITE_TITLE = 'S-Reborn World';
export const SITE_DESCRIPTION = 'AI of the people, by the people, for the people';

export const CATEGORIES = [
	// AI 이론·기술
	{ id: 'ai', label: 'AI 개론', icon: '🤖' },
	{ id: 'ai-history', label: 'AI 개발 역사', icon: '🏛️' },
	{ id: 'ai-terminology', label: 'AI 용어·어원', icon: '📖' },
	{ id: 'prompt-engineering', label: '프롬프트 엔지니어링', icon: '✏️' },
	{ id: 'context-engineering', label: '컨텍스트 엔지니어링', icon: '🧩' },
	{ id: 'ai-agents', label: 'AI 에이전트 실전', icon: '⚙️' },
	// 의료 AI
	{ id: 'doctor-ai', label: 'Doctor AI', icon: '🩺' },
	{ id: 'medical-data-science', label: '의료 데이터 과학', icon: '📊' },
	{ id: 'clinical-research', label: '임상 연구·AI', icon: '🔬' },
	{ id: 'doctor-dev', label: '의사-개발자', icon: '🖥️' },
	{ id: 'ai-tools', label: 'AI 도구', icon: '🔧' },
	{ id: 'ai-news', label: 'AI 뉴스', icon: '📰' },
	{ id: 'faq', label: 'FAQ', icon: '❓' },
	{ id: 'regulations', label: '규제·법률', icon: '⚖️' },
	{ id: 'tips', label: '5분 팁', icon: '⏱️' },
	{ id: 'aerini', label: '애린이 코너', icon: '🌱' },
	// 지식·학문
	{ id: 'medicine', label: '의학', icon: '🏥' },
	{ id: '학습', label: '학습', icon: '📚' },
	{ id: 'dev', label: '개발', icon: '💻' },
	{ id: '연결·패턴', label: '연결·패턴', icon: '✍️' },
] as const;

// 카테고리 추가: CATEGORIES 배열에 항목 추가 후 Obsidian _BLOG/ 폴더에 동일 이름 폴더 생성
// 하위 카테고리: frontmatter의 subcategory 필드 사용 (자유 문자열)
