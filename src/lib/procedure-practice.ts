import fs from 'node:fs';
import path from 'node:path';

export type ProcedureTask = {
	id: string;
	label: string;
	note: string;
	record: string;
	view: string;
	prompt: string;
	text: string;
};

const itemsDir = path.join(process.cwd(), 'public/downloads/procedure-archive/items');

function readItem(name: string): string {
	return fs.readFileSync(path.join(itemsDir, name), 'utf8');
}

export const procedureChecks = [
	'원문에 없는 호전, 진단, 예약 확정이 들어갔는가.',
	'비어 있던 항목을 문제없음으로 바꿨는가.',
	'직원 말투를 하나의 공식 문장으로 합쳤는가.',
	'위험 신호를 평범한 경과의 문장으로 내렸는가.',
];

export const procedureTasks: ProcedureTask[] = [
	{
		id: 'summary',
		label: '경과 요약',
		note: '시간 순서로 확인된 것과 모르는 것을 나눔',
		record: 'P-055 울쎄라 · 강수연 · 집에서 문의',
		view: '/tools/procedure-archive/view/P-055/',
		prompt: `직원 문장은 같은 양식으로 다시 쓰지 마세요.
아래 원문만 보고, 시간 순서대로 '언제 / 누가 말했는지 / 확인된 내용 / 아직 모르는 것'으로 적으세요.
고객이 말한 느낌과 직원이 해석한 말을 나누세요.
기록에 없는 호전, 진단, 예약 확정을 만들지 마세요.
각 줄 끝에 근거가 된 원문 문장을 짧게 남기세요.`,
		text: readItem('P-055_집에서문의_울쎄라.txt'),
	},
	{
		id: 'risk',
		label: '위험 신호 찾기',
		note: '혈관 징후, 임신, 복약처럼 놓치면 안 되는 줄만 고름',
		record: 'P-119 필러 · 신미경 · 부작용 재내원',
		view: '/tools/procedure-archive/view/P-119/',
		prompt: `직원 문체를 통일하지 마세요.
아래 원문에서만 위험 신호와 확인이 덜 된 항목을 고르세요.
혈관 쪽 신호(피부가 하얗거나 그물처럼 변함, 심한 통증, 시야 이상), 임신·수유, 피를 묽게 하는 약, 알레르기, 마취제 반응을 찾으세요.
기록에 없으면 '기록에 없음'이라고만 적으세요. 없는 내용을 문제없음으로 바꾸지 마세요.`,
		text: readItem('P-119_부작용재내원_필러.txt'),
	},
	{
		id: 'call',
		label: '해피콜 체크리스트',
		note: '다음 전화에서 물어볼 질문만 만듦',
		record: 'P-082 울쎄라 · 강수연 · 해피콜',
		view: '/tools/procedure-archive/view/P-082/',
		prompt: `해피콜 원문은 고치지 마세요. 다음 전화에서 물어볼 목록만 만드세요.
통증, 피부색 변화, 시야, 갑자기 붓는 느낌, 임신·수유, 새로 먹은 약, 사진을 찍은 시각을 넣으세요.
원문에 답이 있으면 그 답을 적고, 없으면 '아직 안 물어봄'이라고 적으세요.
예약이 확정됐는지는 원문에 있을 때만 적으세요. 진단은 내리지 마세요.`,
		text: readItem('P-082_해피콜_울쎄라.txt'),
	},
	{
		id: 'compare',
		label: '직원별 기록 비교',
		note: '서로 다른 말투를 합치지 않고 사실만 나눔',
		record: 'P-001 서유리 · P-019 권수아, 같은 고객 강수연',
		view: '/tools/procedure-archive/view/P-001/',
		prompt: `두 직원의 원문을 하나의 문체로 합치지 마세요.
직원별로 '말투 한 줄 / 실제로 적은 사실 / 적지 않은 것'을 나누세요.
같은 고객이라는 이유만으로 서로 없는 사실을 옮겨 적지 마세요.`,
		text: `${readItem('P-001_시술전체크_울쎄라.txt')}\n\n----\n\n${readItem('P-019_시술중_울쎄라.txt')}`,
	},
	{
		id: 'note',
		label: '환자 안내문',
		note: '원문에 있는 내용만 환자가 읽을 글로 옮김',
		record: 'P-037 울쎄라 · 강수연 · 귀가 안내',
		view: '/tools/procedure-archive/view/P-037/',
		prompt: `환자가 읽을 짧은 안내만 쓰세요. 직원 원문의 말투는 안내문에 섞지 말고, 내용은 원문에 있는 것만 쓰세요.
확인되지 않은 약, 샷수, 다음 예약은 '아직 확인 전'이라고 적으세요.
심한 통증, 색이 진행되는 변화, 시야 이상이 있으면 메시지를 기다리지 말고 바로 진료받으라고 안내하세요.
진단명을 만들지 마세요.`,
		text: readItem('P-037_귀가안내_울쎄라.txt'),
	},
];
