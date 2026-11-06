import fs from 'node:fs';
import path from 'node:path';
import { readXlsx, tableToTsv, type XlsxSheet } from './xlsx-simple';

export type MaterialKind = 'md' | 'csv' | 'xlsx';

export type MaterialFile = {
	name: string;
	note: string;
	href: string;
	size: string;
	kind: MaterialKind;
	attachWhere: string;
	usedIn: string;
	previewId: string;
};

const dir = path.join(process.cwd(), 'public/downloads/daemire-1108');

export const DAEMIRE_FILES: Omit<MaterialFile, 'href' | 'size' | 'kind' | 'previewId'>[] = [
	{
		name: '00_시작하기_자료사용가이드.md',
		note: '혼자 따라갈 때 먼저 읽습니다. 이 페이지에도 같은 순서가 있습니다.',
		attachWhere: '첨부하지 않습니다. 이 화면에서 읽습니다.',
		usedIn: '시작',
	},
	{
		name: '01_고객정보_수집경로별_원본예시와_자동정리.md',
		note: '방문 표를 열기 전에 읽습니다. 대화·알림·메모가 한 줄이 되는 과정입니다.',
		attachWhere: '첨부하지 않습니다. 이 화면에서 읽습니다.',
		usedIn: '강연1 준비',
	},
	{
		name: '2026년10월_방문시술매출_CRM.xlsx',
		note: '2026년 10월 방문 200건. 한 행은 방문 1건입니다.',
		attachWhere: 'ChatGPT 입력창 왼쪽 + 또는 클립 → 파일 업로드. 못 받으면 이 페이지 표를 복사해 같은 입력창에 붙여 넣습니다.',
		usedIn: '강연1 1·3·5·6·9칸',
	},
	{
		name: '2026년10월_상담문의_목록.csv',
		note: '2026년 10월 상담 문의 96건입니다.',
		attachWhere: 'ChatGPT 입력창 왼쪽 + 또는 클립 → 파일 업로드. 못 받으면 이 페이지 표를 복사합니다.',
		usedIn: '강연1 2·6칸',
	},
	{
		name: 'L1_프롬프트와_슬라이드별_실습가이드_v3.md',
		note: '강연1에서 붙여 넣는 문장이 칸마다 있습니다. 이 페이지 강연1 탭과 같습니다.',
		attachWhere: '첨부하지 않습니다.',
		usedIn: '강연1',
	},
	{
		name: 'L1_지표정의_결정카드_템플릿.md',
		note: '재방문율처럼 숫자를 세기 전에 기준을 적는 카드입니다.',
		attachWhere: '첨부하지 않습니다. 이 화면에서 빈칸을 읽습니다.',
		usedIn: '강연1 4칸',
	},
	{
		name: 'L1_검산과_데이터품질_체크리스트.md',
		note: '합계, 빠진 값, 중복을 원본과 대조할 때 엽니다.',
		attachWhere: '첨부하지 않습니다. AI 답이 나온 뒤 이 화면과 표를 대조합니다.',
		usedIn: '강연1 9칸',
	},
	{
		name: 'L2_원가_BEP_시연입력_v1.0_v4.xlsx',
		note: '강연2 계산기 입력. 기준 단가 200,000원, 변동원가 50,000원, 월 고정비 15,000,000원.',
		attachWhere: 'ChatGPT에 첨부하거나, 못 받으면 이 페이지 입력 표를 복사합니다. 계산 자체는 아래 계산기에서 실행합니다.',
		usedIn: '강연2 1칸',
	},
	{
		name: 'L2_원가_BEP_시연입력_v4.csv',
		note: '같은 입력의 CSV입니다.',
		attachWhere: '엑셀을 열 수 없으면 이 CSV를 첨부하거나 이 페이지 표를 복사합니다.',
		usedIn: '강연2 1칸 대체',
	},
	{
		name: 'L2_원가_BEP_독립검산_v4.xlsx',
		note: 'AI 결과와 따로 맞춰 보는 검산표입니다. 단가 인하는 변동원가 50,000원을 유지합니다.',
		attachWhere: '첨부하지 않습니다. 이 페이지 검산 표와 계산기 결과를 사람이 대조합니다.',
		usedIn: '강연2 4·5·8칸',
	},
	{
		name: 'L2_AI도구_제작프롬프트와_검증테스트_v3.md',
		note: '강연2에서 붙여 넣는 문장입니다. 이 페이지 강연2 탭과 같습니다.',
		attachWhere: '첨부하지 않습니다.',
		usedIn: '강연2',
	},
	{
		name: 'L2_내병원_작은도구_기획시트.md',
		note: '내 병원 고정비와 시술별 원가를 적는 시트입니다. 예제 숫자를 복사하지 않습니다.',
		attachWhere: '첨부하지 않습니다.',
		usedIn: '강연2 7칸',
	},
	{
		name: 'DML_A-H_8대페인포인트_강연순서_1페이지_인덱스_v1.md',
		note: 'A–H 한 장 색인입니다. 본문은 Pain Point 페이지입니다.',
		attachWhere: '첨부하지 않습니다.',
		usedIn: '문제 발견',
	},
];

function kindOf(name: string): MaterialKind {
	if (name.endsWith('.xlsx')) return 'xlsx';
	if (name.endsWith('.csv')) return 'csv';
	return 'md';
}

function fileSize(name: string): string {
	const bytes = fs.statSync(path.join(dir, name)).size;
	if (bytes < 1024) return `${bytes} B`;
	return `${(bytes / 1024).toFixed(1)} KB`;
}

export function daemireMaterials(): MaterialFile[] {
	if (DAEMIRE_FILES.length !== 13) {
		throw new Error(`대미레 다운로드는 13개여야 합니다. 현재 ${DAEMIRE_FILES.length}개`);
	}
	return DAEMIRE_FILES.map((item) => {
		fs.accessSync(path.join(dir, item.name));
		return {
			...item,
			href: `/downloads/daemire-1108/${encodeURIComponent(item.name)}`,
			size: fileSize(item.name),
			kind: kindOf(item.name),
			previewId: `file-${item.name.replace(/[^\w가-힣]+/g, '-')}`,
		};
	});
}

function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let quoted = false;
	for (let i = 0; i < text.length; i += 1) {
		const ch = text[i];
		if (quoted) {
			if (ch === '"' && text[i + 1] === '"') {
				cell += '"';
				i += 1;
			} else if (ch === '"') quoted = false;
			else cell += ch;
			continue;
		}
		if (ch === '"') quoted = true;
		else if (ch === ',') {
			row.push(cell);
			cell = '';
		} else if (ch === '\n') {
			if (cell.endsWith('\r')) cell = cell.slice(0, -1);
			row.push(cell);
			rows.push(row);
			row = [];
			cell = '';
		} else cell += ch;
	}
	if (cell.length > 0 || row.length > 0) {
		row.push(cell);
		rows.push(row);
	}
	return rows.filter((item) => item.some((value) => value.trim() !== ''));
}

export function materialText(name: string): string {
	return fs.readFileSync(path.join(dir, name), 'utf8');
}

export function materialCsv(name: string): string[][] {
	return parseCsv(materialText(name));
}

export function materialXlsx(name: string, dateCols: number[] = []): XlsxSheet[] {
	return readXlsx(path.join(dir, name), dateCols);
}

export function countBy(rows: string[][], colName: string): { label: string; count: number }[] {
	const header = rows[0] ?? [];
	const idx = header.indexOf(colName);
	if (idx < 0) return [];
	const map = new Map<string, number>();
	for (const row of rows.slice(1)) {
		const key = row[idx] || '(빈칸)';
		map.set(key, (map.get(key) ?? 0) + 1);
	}
	return [...map.entries()]
		.map(([label, count]) => ({ label, count }))
		.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ko'));
}

export function sumCol(rows: string[][], colName: string): number {
	const header = rows[0] ?? [];
	const idx = header.indexOf(colName);
	if (idx < 0) return 0;
	return rows.slice(1).reduce((sum, row) => sum + (Number(row[idx]) || 0), 0);
}

export function nonemptyCount(rows: string[][], colName: string): { filled: number; empty: number } {
	const header = rows[0] ?? [];
	const idx = header.indexOf(colName);
	let filled = 0;
	let empty = 0;
	for (const row of rows.slice(1)) {
		if ((row[idx] ?? '').trim()) filled += 1;
		else empty += 1;
	}
	return { filled, empty };
}

export { tableToTsv };
