import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blocksToMarkdown } from './blocks-to-md.ts';
import {
	type ResearchDocument,
	notionAreaToId,
	statusFromNotion,
	validateAndBuild,
} from '../../src/lib/research/tree.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const NOTION_VERSION = '2022-06-28';

function requiredEnv(name: string) {
	const value = process.env[name]?.trim();
	if (!value) throw new Error(`${name} is missing`);
	return value;
}

async function notion(token: string, url: string, init?: RequestInit) {
	const response = await fetch(url, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			'Notion-Version': NOTION_VERSION,
			'Content-Type': 'application/json',
			...(init?.headers ?? {}),
		},
	});
	if (!response.ok) {
		throw new Error(`Notion ${response.status} ${url}: ${await response.text()}`);
	}
	return response.json() as Promise<any>;
}

function textOf(property: any) {
	if (!property) return '';
	if (property.type === 'rich_text') return (property.rich_text ?? []).map((item: any) => item.plain_text).join('').trim();
	if (property.type === 'title') return (property.title ?? []).map((item: any) => item.plain_text).join('').trim();
	if (property.type === 'select') return property.select?.name ?? '';
	if (property.type === 'status') return property.status?.name ?? '';
	if (property.type === 'number') return property.number;
	if (property.type === 'date') return property.date?.start ?? null;
	return '';
}

function yamlEscape(value: string) {
	return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('\n', ' ')}"`;
}

function renderMdx(doc: ResearchDocument, body: string) {
	const related =
		doc.relatedIds.length === 0
			? 'relatedIds: []'
			: `relatedIds:\n${doc.relatedIds.map((id) => `  - ${id}`).join('\n')}`;
	return `---
documentId: ${doc.documentId}
title: ${yamlEscape(doc.title)}
description: ${yamlEscape(doc.description)}
researchArea: ${doc.researchArea}
parentId: ${doc.parentId ? yamlEscape(doc.parentId) : 'null'}
${related}
slug: ${doc.slug}
status: ${doc.status}
order: ${doc.order}
version: ${yamlEscape(doc.version)}
publishedAt: ${doc.publishedAt ?? 'null'}
updatedAt: ${doc.updatedAt}
---

${body.trim()}
`;
}

function renderRedirects(map: Record<string, string>) {
	const lines = Object.entries(map)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([from, to]) => `\t${JSON.stringify(from)}: ${JSON.stringify(to)},`)
		.join('\n');
	return `/** Research path moves and the three former homepage-card URLs. */\nexport const RESEARCH_REDIRECTS = {\n${lines}\n};\n`;
}

async function queryAll(token: string, databaseId: string) {
	const pages: any[] = [];
	let cursor: string | undefined;
	do {
		const payload: Record<string, unknown> = { page_size: 100 };
		if (cursor) payload.start_cursor = cursor;
		const data = await notion(token, `https://api.notion.com/v1/databases/${databaseId}/query`, {
			method: 'POST',
			body: JSON.stringify(payload),
		});
		pages.push(...data.results);
		cursor = data.has_more ? data.next_cursor : undefined;
	} while (cursor);
	return pages;
}

async function allBlocks(token: string, blockId: string) {
	const blocks: any[] = [];
	let cursor: string | undefined;
	do {
		const url = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);
		url.searchParams.set('page_size', '100');
		if (cursor) url.searchParams.set('start_cursor', cursor);
		const data = await notion(token, url.toString());
		blocks.push(...data.results);
		cursor = data.has_more ? data.next_cursor : undefined;
	} while (cursor);
	return blocks;
}

async function writeIfChanged(file: string, next: string) {
	let prev = '';
	try {
		prev = await readFile(file, 'utf8');
	} catch {
		prev = '';
	}
	if (prev === next) return false;
	await mkdir(path.dirname(file), { recursive: true });
	await writeFile(file, next);
	return true;
}

async function main() {
	const token = requiredEnv('NOTION_TOKEN');
	const databaseId = requiredEnv('NOTION_RESEARCH_DATABASE_ID');
	const pages = await queryAll(token, databaseId);
	const pageIdToDocId = new Map<string, string>();
	for (const page of pages) {
		pageIdToDocId.set(page.id.replaceAll('-', ''), textOf(page.properties['Document ID']));
		pageIdToDocId.set(page.id, textOf(page.properties['Document ID']));
	}

	const docs: ResearchDocument[] = [];
	for (const page of pages) {
		const documentId = textOf(page.properties['Document ID']);
		const area = notionAreaToId(textOf(page.properties['Research Area']));
		const status = statusFromNotion(textOf(page.properties['Status']));
		const parentIds = (page.properties.Parent?.relation ?? []).map((item: { id: string }) => pageIdToDocId.get(item.id)).filter(Boolean);
		const relatedIds = (page.properties.Related?.relation ?? []).map((item: { id: string }) => pageIdToDocId.get(item.id)).filter(Boolean);
		if (!documentId || !area || !status) {
			throw new Error(`Incomplete Notion row ${page.url ?? page.id}`);
		}
		docs.push({
			documentId,
			title: textOf(page.properties.Title) || documentId,
			description: '',
			researchArea: area,
			parentId: parentIds[0] ?? null,
			relatedIds,
			slug: textOf(page.properties.Slug),
			status,
			order: Number(page.properties.Order?.number ?? 0),
			version: textOf(page.properties.Version) || '0.1',
			publishedAt: textOf(page.properties['Published At']),
			updatedAt: page.last_edited_time,
		});
	}

	const { byId, byPath } = validateAndBuild(docs);
	const previousRegistry = JSON.parse(await readFile(path.join(root, 'src/data/research-registry.json'), 'utf8'));
	const previousById = new Map<string, any>((previousRegistry.documents ?? []).map((item: any) => [item.documentId, item]));
	const redirects: Record<string, string> = {
		'/blog/orchestration/what-is-orchestration': '/research/multi-ai/',
		'/blog/orchestration/human-in-the-loop': '/research/human-ai/',
		'/blog/orchestration/workflow-patterns': '/research/workflow/',
	};

	const contentDir = path.join(root, 'src/content/research');
	await mkdir(contentDir, { recursive: true });
	const keep = new Set<string>();

	for (const doc of docs) {
		const node = byId.get(doc.documentId);
		if (!node) continue;
		const previous = previousById.get(doc.documentId);
		if (previous?.path && previous.path !== node.path) {
			redirects[previous.path.replace(/\/+$/, '')] = node.path;
		}
		if (!node.bodyPublic) continue;
		const page = pages.find((item) => textOf(item.properties['Document ID']) === doc.documentId);
		const mediaDir = path.join(root, 'public/research/media', doc.documentId);
		const body = await blocksToMarkdown(await allBlocks(token, page.id), {
			loadChildren: (id) => allBlocks(token, id),
			rewriteImage: async (url, blockId) => {
				await mkdir(mediaDir, { recursive: true });
				const ext = path.extname(new URL(url).pathname) || '.img';
				const file = path.join(mediaDir, `${blockId}${ext}`);
				const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
				await writeFile(file, bytes);
				return `/research/media/${doc.documentId}/${blockId}${ext}`;
			},
		});
		const firstParagraph = body.split('\n').find((line) => line && !line.startsWith('#') && !line.startsWith('>')) ?? '';
		node.description = node.description || firstParagraph.replace(/[#*_]/g, '').slice(0, 180);
		doc.description = node.description;
		const file = path.join(contentDir, `${doc.documentId}.mdx`);
		keep.add(path.basename(file));
		await writeIfChanged(file, renderMdx(doc, body));
	}

	for (const name of await readdir(contentDir)) {
		if (name.endsWith('.mdx') && !keep.has(name)) await unlink(path.join(contentDir, name));
	}

	const registry = {
		generatedAt: new Date().toISOString(),
		source: 'SREBORN Research Registry',
		documents: docs.map((doc) => ({ ...doc, path: byId.get(doc.documentId)?.path })),
	};
	await writeIfChanged(path.join(root, 'src/data/research-registry.json'), `${JSON.stringify(registry, null, 2)}\n`);
	await writeIfChanged(path.join(root, 'functions/research-redirects.js'), renderRedirects(redirects));
	validateAndBuild(docs);
	console.log(`Synced ${docs.length} documents, ${keep.size} published pages, ${byPath.size} paths.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
