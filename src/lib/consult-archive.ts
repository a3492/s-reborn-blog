export type ConsultRecord = {
	id: string;
	batch: string;
	channel: string;
	writer: string;
	grade: string;
	chars: number;
	customer: string;
	name: string;
	title: string;
	preview: string;
	file: string;
};

export type ConsultStory = {
	id: string;
	title: string;
	person: string;
	customer: string;
	lead: string;
	read: string;
	ids: string[];
	prompt: string;
	checks: string[];
};

export type CustomerGroup = {
	customer: string;
	name: string;
	items: ConsultRecord[];
	chars: number;
	channels: string[];
	longCount: number;
};

export const gradeFilters: Array<[string, string]> = [
	['XXL', '장시간 상담'],
	['XL', '매우 긴 기록'],
	['L', '긴 기록'],
	['M', '상담 한 건'],
	['S', '짧은 메모'],
	['XS', '아주 짧은 메모'],
];

export const consultStories: ConsultStory[] = [
	{
		id: 'yuna',
		title: '긴 상담부터',
		person: '김유나',
		customer: 'B02-C021',
		lead: '내원 상담 한 건이 약 1만 자입니다. 그 전에 인스타, 예약, CRM에 짧은 메모가 따로 있습니다.',
		read: '먼저 장시간 상담을 읽습니다. 그다음 짧은 메모를 보면, 내원 전에 무엇이 빠졌는지가 보입니다.',
		ids: ['B02-L01', 'B02-E084', 'B02-E083', 'B02-E082', 'B02-E081'],
		prompt: `아래는 실습용 가상 고객 김유나(B02-C021)의 기록입니다. 직원의 말투는 고치지 마세요.
1) 장시간 내원 상담에서 고객이 직접 말한 고민, 아직 정하지 않은 것, 일정 제약을 나누세요.
2) 짧은 메모는 경로별로 무엇을 담고 있는지, 긴 상담과 겹치거나 빠지는 점을 적으세요.
3) 원문에 없는 시술 결정, 금액, 진단은 '미확인'으로 두세요.
4) 각 항목 옆에 파일명을 적으세요.`,
		checks: [
			'고객이 정하지 않은 일을 시술 결정으로 적지 않았는가.',
			'짧은 메모에만 있는 말을 긴 상담의 결론처럼 올리지 않았는가.',
			'원문에 없는 금액, 진단, 예약 확정을 만들지 않았는가.',
			'각 문장 옆에 파일명을 찾을 수 있는가.',
		],
	},
	{
		id: 'minji',
		title: '짧은 메모만 있는 사람',
		person: '김민지',
		customer: 'B01-C001',
		lead: '긴 상담 파일이 없습니다. 카톡, 인스타, 예약, 전화, 폼, 문자, CRM에 짧은 메모가 열 장 있습니다.',
		read: '압축을 풀면 짧게 보이던 글이 이 경우입니다. 파일 하나가 상담 전부가 아니라, 경로마다 남은 조각입니다.',
		ids: [
			'B01-E001',
			'B01-E028',
			'B01-E035',
			'B01-E056',
			'B01-E061',
			'B01-E085',
			'B02-E001',
			'B02-E002',
			'B02-E003',
			'B02-E004',
		],
		prompt: `아래는 실습용 가상 고객 김민지(B01-C001)에게 연결된 짧은 기록입니다. 한 파일도 상담 전체가 아닙니다.
1) 경로별로 원문에서 확인된 내용만 적으세요.
2) 고객 키 B01-C001만 다루세요. 이름이 같다고 다른 사람을 섞지 마세요.
3) 문의, 예약, 방문, 시술, 결제를 같은 단계로 합치지 마세요. 기록에 없으면 '미확인'입니다.
4) 마지막에, 이 조각들만으로 알 수 없는 것을 다섯 줄로 적으세요.`,
		checks: [
			'열 장의 메모를 상담 한 건으로 합치지 않았는가.',
			'예약 문의와 방문, 시술을 같은 상태로 세지 않았는가.',
			'비어 있는 항목을 없음으로 바꾸지 않았는가.',
			'알 수 없는 일을 마지막에 따로 적었는가.',
		],
	},
	{
		id: 'hyunwoo',
		title: '말이 서로 다른 기록',
		person: '강현우',
		customer: 'B01-C009',
		lead: '재진입니다. 약 1만 자의 내원 상담과, 전화·문자·CRM에 남은 짧은 메모가 같이 있습니다.',
		read: '긴 상담을 먼저 읽고, 짧은 메모와 문장이 다른 곳이 있는지 봅니다. 어느 쪽도 임의로 고르지 않습니다.',
		ids: [
			'B02-L02',
			'B02-E036',
			'B02-E035',
			'B02-E033',
			'B02-E034',
			'B01-E101',
			'B01-E081',
			'B01-E078',
			'B01-E052',
			'B01-E057',
			'B01-E024',
		],
		prompt: `아래는 실습용 가상 고객 강현우(B01-C009)의 재진 기록입니다. 긴 상담과 짧은 메모가 같이 있습니다.
1) 고객이 말한 걱정, 직원이 해석한 말, 파일마다 달라 보이는 말을 나누세요.
2) 알레르기, 복약, 임신·수유, 이전 부작용, 기저질환은 문장에 있을 때만 적으세요. 없으면 '기록에 없음'이라고 적으세요. 기록에 없음을 해당 없음으로 바꾸지 마세요.
3) 파일의 말이 다르면 어느 쪽도 고르지 말고 '기록이 다름'과 파일명을 적으세요.
4) 시술해도 되는지는 판단하지 마세요.`,
		checks: [
			'서로 다른 문장을 한쪽으로 정리하지 않았는가.',
			'기록에 없는 건강 정보를 해당 없음으로 바꿨는가.',
			'직원의 해석을 고객이 말한 사실로 적지 않았는가.',
			'시술 가능 여부를 결론으로 쓰지 않았는가.',
		],
	},
];

export function lengthKind(grade: string): string {
	if (grade === 'XXL' || grade === 'XL') return '장시간 상담';
	if (grade === 'L') return '긴 기록';
	if (grade === 'M') return '상담 한 건';
	if (grade === 'S') return '짧은 메모';
	return '아주 짧은 메모';
}

export function lengthLabel(record: Pick<ConsultRecord, 'chars' | 'grade'>): string {
	return `${record.chars.toLocaleString('ko-KR')}자 · ${lengthKind(record.grade)}`;
}

export function previewLine(preview: string, max = 76): string {
	const text = preview.replace(/\s+/g, ' ').trim();
	if (text.length <= max) return text;
	return `${text.slice(0, max).trimEnd()}…`;
}

export function writerLabel(writer: string): string {
	if (writer === '1차 묶음') return '작성자 이름 없음';
	return writer.replace(/^W\d+\s+/, '');
}

export function fileHref(name: string): string {
	return `/downloads/consult-archive/${name
		.split('/')
		.map((part) => encodeURIComponent(part))
		.join('/')}`;
}

export function viewHref(id: string): string {
	return `/tools/consult-archive/view/${encodeURIComponent(id)}/`;
}

export function recordsInOrder(records: ConsultRecord[], ids: string[]): ConsultRecord[] {
	const byId = new Map(records.map((record) => [record.id, record]));
	return ids.map((id) => {
		const record = byId.get(id);
		if (!record) throw new Error(`연습 이야기에 없는 기록입니다: ${id}`);
		return record;
	});
}

export function groupByCustomer(records: ConsultRecord[]): CustomerGroup[] {
	const map = new Map<string, ConsultRecord[]>();
	for (const record of records) {
		const list = map.get(record.customer) ?? [];
		list.push(record);
		map.set(record.customer, list);
	}
	const groups = [...map.values()].map((items) => {
		const sorted = [...items].sort((a, b) => b.chars - a.chars || a.id.localeCompare(b.id));
		return {
			customer: sorted[0].customer,
			name: sorted[0].name,
			items: sorted,
			chars: sorted.reduce((sum, item) => sum + item.chars, 0),
			channels: [...new Set(sorted.map((item) => item.channel))],
			longCount: sorted.filter((item) => item.grade === 'XL' || item.grade === 'XXL').length,
		};
	});
	groups.sort(
		(a, b) => b.longCount - a.longCount || b.chars - a.chars || a.name.localeCompare(b.name, 'ko'),
	);
	return groups;
}
