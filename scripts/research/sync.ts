import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@notionhq/client';
import { blocksToMarkdown } from './blocks-to-md.ts';
import {
	type ResearchDocument,
	notionAreaToId,
	publicDocuments,
	statusFromNotion,
	validateAndBuild,
} from '../../src/lib/research/tree.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function loadLocalEnv() {
	if (process.env.NOTION_TOKEN && process.env.NOTION_RESEARCH_DATABASE_ID) return;
	try {
		const text = await readFile(path.join(root, '.env.local'), 'utf8');
		for (const line of text.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eq = trimmed.indexOf('=');
			if (eq < 1) continue;
			const key = trimmed.slice(0, eq).trim();
			if (key !== 'NOTION_TOKEN' && key !== 'NOTION_RESEARCH_DATABASE_ID') continue;
			if (process.env[key]) continue;
			process.env[key] = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
		}
	} catch {
		// GitHub Actions uses secrets, not .env.local.
	}
}

function requiredEnv(name: string) {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`${name} is missing. See docs/research/NOTION_SETUP_KO.md`);
	}
	return value;
}

function textOf(property: { type?: string; [key: string]: unknown } | undefined) {
	if (!property) return '';
	if (property.type === 'rich_text') {
		return ((property.rich_text as { plain_text?: string }[]) ?? []).map((item) => item.plain_text ?? '').join('').trim();
	}
	if (property.type === 'title') {
		return ((property.title as { plain_text?: string }[]) ?? []).map((item) => item.plain_text ?? '').join('').trim();
	}
	if (property.type === 'select') return (property.select as { name?: string } | null)?.name ?? '';
	if (property.type === 'status') return (property.status as { name?: string } | null)?.name ?? '';
	if (property.type === 'number') return property.number as number | null;
	if (property.type === 'date') return (property.date as { start?: string } | null)?.start ?? null;
	if (property.type === 'checkbox') return Boolean(property.checkbox);
	return '';
}

function titleOf(props: Record<string, { type?: string; [key: string]: unknown }>) {
	const named = props.Title || props.title || props.Name;
	if (named) return String(textOf(named) || '');
	const found = Object.values(props).find((item) => item?.type === 'title');
	return found ? String(textOf(found) || '') : '';
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

async function queryAll(notion: Client, databaseId: string) {
	const pages: Awaited<ReturnType<Client['databases']['query']>>['results'] = [];
	let cursor: string | undefined;
	do {
		const data = await notion.databases.query({
			database_id: databaseId,
			start_cursor: cursor,
			page_size: 100,
		});
		pages.push(...data.results);
		cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
	} while (cursor);
	return pages;
}

async function allBlocks(notion: Client, blockId: string) {
	const blocks: Awaited<ReturnType<Client['blocks']['children']['list']>>['results'] = [];
	let cursor: string | undefined;
	do {
		const data = await notion.blocks.children.list({
			block_id: blockId,
			start_cursor: cursor,
			page_size: 100,
		});
		blocks.push(...data.results);
		cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
	} while (cursor);
	return blocks;
}

async function main() {
	await loadLocalEnv();
	const token = requiredEnv('NOTION_TOKEN');
	const databaseId = requiredEnv('NOTION_RESEARCH_DATABASE_ID');
	const notion = new Client({ auth: token });
	const pages = await queryAll(notion, databaseId);
	const pageIdToDocId = new Map<string, string>();
	for (const page of pages) {
		if (!('properties' in page)) continue;
		const documentId = textOf(page.properties['Document ID']);
		pageIdToDocId.set(page.id.replaceAll('-', ''), documentId);
		pageIdToDocId.set(page.id, documentId);
	}

	const docs: ResearchDocument[] = [];
	for (const page of pages) {
		if (!('properties' in page)) continue;
		const props = page.properties;
		const documentId = textOf(props['Document ID']);
		const area = notionAreaToId(textOf(props['Research Area']));
		const status = statusFromNotion(String(textOf(props.Status)));
		const parentIds = ((props.Parent as { relation?: { id: string }[] } | undefined)?.relation ?? [])
			.map((item) => pageIdToDocId.get(item.id))
			.filter((id): id is string => Boolean(id));
		const relatedIds = ((props.Related as { relation?: { id: string }[] } | undefined)?.relation ?? [])
			.map((item) => pageIdToDocId.get(item.id))
			.filter((id): id is string => Boolean(id));
		if (!documentId || !area || !status) {
			throw new Error(`Incomplete Notion row ${'url' in page ? page.url : page.id}`);
		}
		const isRoot = Boolean(textOf(props.Root));
		const parentId = parentIds[0] ?? null;
		if (isRoot && parentId) {
			throw new Error(`${documentId} is marked Root but has a Parent`);
		}
		docs.push({
			documentId,
			title: titleOf(props) || documentId,
			description: '',
			researchArea: area,
			parentId,
			relatedIds,
			slug: String(textOf(props.Slug)),
			status,
			order: Number(props.Order && 'number' in props.Order ? props.Order.number ?? 0 : 0),
			version: String(textOf(props.Version) || '0.1'),
			publishedAt: (textOf(props['Published At']) as string | null) || null,
			updatedAt: 'last_edited_time' in page ? page.last_edited_time : new Date().toISOString(),
		});
	}

	const { byId } = validateAndBuild(docs);
	const publishedDocs = publicDocuments(docs, [...byId.values()]);
	const contentDir = path.join(root, 'src/content/research');
	await mkdir(contentDir, { recursive: true });
	const keep = new Set<string>();

	for (const doc of publishedDocs) {
		const node = byId.get(doc.documentId);
		if (!node?.bodyPublic) continue;
		const page = pages.find((item) => 'properties' in item && textOf(item.properties['Document ID']) === doc.documentId);
		if (!page) continue;
		const mediaDir = path.join(root, 'public/research/media', doc.documentId);
		const body = await blocksToMarkdown(await allBlocks(notion, page.id), {
			loadChildren: (id) => allBlocks(notion, id),
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
		doc.description = doc.description || firstParagraph.replace(/[#*_]/g, '').slice(0, 180);
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
		documents: publishedDocs.map((doc) => ({ ...doc, path: byId.get(doc.documentId)?.path })),
	};
	await writeIfChanged(path.join(root, 'src/data/research-registry.json'), `${JSON.stringify(registry, null, 2)}\n`);
	validateAndBuild(publishedDocs);
	console.log(`Synced ${publishedDocs.length} published pages from ${docs.length} Notion rows.`);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : 'Research sync failed');
	process.exit(1);
});
