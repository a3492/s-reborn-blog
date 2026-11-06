import { zipRead } from './zip-read';

const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

function decodeXml(text: string): string {
	return text
		.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
		.replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, '&');
}

function colIndex(ref: string): number {
	const letters = ref.replace(/\d+/g, '');
	let n = 0;
	for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
	return n - 1;
}

function rowIndex(ref: string): number {
	return Number(ref.replace(/\D+/g, ''));
}

function excelDate(serial: string): string {
	const n = Number(serial);
	if (!Number.isFinite(n) || n < 20000 || n > 80000) return serial;
	const utc = Date.UTC(1899, 11, 30) + Math.round(n) * 86400000;
	return new Date(utc).toISOString().slice(0, 10);
}

function parseSheet(xml: string, dateCols: Set<number>): string[][] {
	const rows = new Map<number, Map<number, string>>();
	const cellRe = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
	let match: RegExpExecArray | null;
	while ((match = cellRe.exec(xml))) {
		const attrs = match[1];
		const body = match[2];
		const ref = /r="([^"]+)"/.exec(attrs)?.[1];
		if (!ref) continue;
		const type = /t="([^"]+)"/.exec(attrs)?.[1] ?? '';
		let value = '';
		if (type === 'inlineStr') {
			const t = /<t[^>]*>([\s\S]*?)<\/t>/.exec(body);
			value = t ? decodeXml(t[1]) : '';
		} else {
			const v = /<v[^>]*>([\s\S]*?)<\/v>/.exec(body);
			value = v ? decodeXml(v[1]) : '';
			if (dateCols.has(colIndex(ref))) value = excelDate(value);
		}
		const r = rowIndex(ref);
		const c = colIndex(ref);
		if (!rows.has(r)) rows.set(r, new Map());
		rows.get(r)!.set(c, value);
	}
	if (rows.size === 0) return [];
	const maxCol = Math.max(...[...rows.values()].flatMap((row) => [...row.keys()])) + 1;
	return [...rows.keys()]
		.sort((a, b) => a - b)
		.map((r) => {
			const row = rows.get(r)!;
			return Array.from({ length: maxCol }, (_, i) => row.get(i) ?? '');
		});
}

export type XlsxSheet = { name: string; rows: string[][] };

export function readXlsx(filePath: string, dateCols: number[] = []): XlsxSheet[] {
	const workbook = zipRead(filePath, 'xl/workbook.xml');
	const rels = zipRead(filePath, 'xl/_rels/workbook.xml.rels');
	const relMap = new Map<string, string>();
	const relRe = /<Relationship\b([^>]*)\/?>/g;
	let relMatch: RegExpExecArray | null;
	while ((relMatch = relRe.exec(rels))) {
		const id = /Id="([^"]+)"/.exec(relMatch[1])?.[1];
		const target = /Target="([^"]+)"/.exec(relMatch[1])?.[1];
		if (id && target) relMap.set(id, target);
	}
	const sheets: XlsxSheet[] = [];
	const sheetRe = /<sheet\b([^>]*)\/?>/g;
	let sheetMatch: RegExpExecArray | null;
	while ((sheetMatch = sheetRe.exec(workbook))) {
		const name = /name="([^"]+)"/.exec(sheetMatch[1])?.[1] ?? 'Sheet';
		const rid = new RegExp(`r:id="([^"]+)"|\\{${NS_REL}\\}id="([^"]+)"`).exec(sheetMatch[1]);
		const id = rid?.[1] ?? rid?.[2];
		if (!id) continue;
		let target = (relMap.get(id) ?? '').replace(/^\//, '');
		if (!target.startsWith('xl/')) target = `xl/${target}`;
		const xml = zipRead(filePath, target);
		sheets.push({ name, rows: parseSheet(xml, new Set(dateCols)) });
	}
	return sheets;
}

export function tableToTsv(rows: string[][]): string {
	return rows.map((row) => row.map((cell) => cell.replace(/\t/g, ' ').replace(/\n/g, ' ')).join('\t')).join('\n');
}
