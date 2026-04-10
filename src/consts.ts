import { SITE_BRAND } from './config/site-brand';

export const SITE_TITLE = SITE_BRAND.blogDisplayName;
export { SITE_BRAND };
export const SITE_DESCRIPTION = 'AI of the people, by the people, for the people';

// 글 요청 수신 이메일 — 검색 결과 없을 때 독자가 에디터에게 요청을 보내는 주소
export const CONTACT_EMAIL = 'a01034920591@gmail.com';

export const CATEGORIES = [
	// 기초·입문
	{ id: 'ai', label: '개론', labelEn: 'Overview', icon: '🤖' },
	{ id: 'aerini', label: '애린이 코너', labelEn: "Beginner's Corner", icon: '🌱' },
	{ id: 'ai-terminology', label: '사전', labelEn: 'Glossary', icon: '📖' },
	// 엔지니어링
	{ id: 'prompt-engineering', label: '프롬프트', labelEn: 'Prompting', icon: '✏️' },
	{ id: 'context-engineering', label: '컨텍스트', labelEn: 'Context', icon: '🧩' },
	{ id: 'harness-engineering', label: '하네스', labelEn: 'Harness', icon: '⛓️' },
	{ id: 'ai-agents', label: '에이전트', labelEn: 'Agents', icon: '⚙️' },
	{ id: 'rag-finetuning', label: 'RAG·파인튜닝', labelEn: 'RAG & Fine-tuning', icon: '🔩' },
	{ id: 'orchestration', label: '오케스트레이션', labelEn: 'Orchestration', icon: '🎼' },
	// 의료
	{ id: 'doctor-ai', label: 'Doctor AI Academy', labelEn: 'Doctor AI Academy', icon: '🩺' },
	{ id: 'medical-data-science', label: '데이터 과학', labelEn: 'Data Science', icon: '📊' },
	{ id: 'clinical-research', label: '임상 연구', labelEn: 'Clinical Research', icon: '🔬' },
	{ id: 'doctor-dev', label: '의사-개발자', labelEn: 'Doctor-Developer', icon: '🖥️' },
	{ id: 'regulations', label: '규제·법률', labelEn: 'Regulations', icon: '⚖️' },
	// 동향·기록
	{ id: 'ai-history', label: '역사', labelEn: 'History', icon: '🏛️' },
	{ id: 'ai-news', label: '뉴스', labelEn: 'News', icon: '📰' },
	{ id: 'faq', label: 'FAQ', labelEn: 'FAQ', icon: '❓' },
	// 도구·실전
	{ id: 'ai-tools-medical', label: '도구·의료', labelEn: 'Tools · Medical', icon: '🔬' },
	{ id: 'ai-tools-general', label: '도구·일반', labelEn: 'Tools · General', icon: '🎨' },
	{ id: 'tips', label: '팁', labelEn: 'Tips', icon: '⏱️' },
	// 기타
	{ id: 'medicine', label: '의학', labelEn: 'Medicine', icon: '🏥' },
	{ id: '학습', label: '학습', labelEn: 'Learning', icon: '📚' },
	{ id: 'dev', label: '개발', labelEn: 'Development', icon: '💻' },
	{ id: '연결·패턴', label: '연결·패턴', labelEn: 'Connections & Patterns', icon: '✍️' },
] as const;

// 메뉴 그룹 구조 (블로그 좌측 내비게이션용)
export const MENU_GROUPS = [
	{
		id: 'basics',
		label: '기초·입문',
		labelEn: 'Fundamentals',
		icon: '📚',
		cats: ['ai', 'aerini', 'ai-terminology'],
	},
	{
		id: 'engineering',
		label: '엔지니어링',
		labelEn: 'Engineering',
		icon: '🔧',
		cats: ['prompt-engineering', 'context-engineering', 'harness-engineering', 'ai-agents', 'rag-finetuning', 'orchestration'],
	},
	{
		id: 'medical',
		label: '의료',
		labelEn: 'Medical',
		icon: '🏥',
		cats: ['doctor-ai', 'medical-data-science', 'clinical-research', 'doctor-dev', 'regulations'],
	},
	{
		id: 'trends',
		label: '동향·기록',
		labelEn: 'Trends & Records',
		icon: '📰',
		cats: ['ai-history', 'ai-news', 'faq'],
	},
	{
		id: 'tools',
		label: '도구·실전',
		labelEn: 'Tools & Practice',
		icon: '⚙️',
		cats: ['ai-tools-medical', 'ai-tools-general', 'tips'],
	},
] as const;

// 카테고리 추가: CATEGORIES 배열에 항목 추가 후 Obsidian _BLOG/ 폴더에 동일 이름 폴더 생성
