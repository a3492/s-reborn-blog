import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { isInternalTag, publicTags, searchableTags, TAG_ALIASES } from '../src/data/tag-aliases.ts';
import {
	ACADEMY_CELLS, ACADEMY_COURSE, FORMAT, LEGACY_CATEGORY_ROUTES, LEVELS, MAPPING_ROWS, TOPICS,
	cellOf, formatOf, levelOf, postIdFromPath,
} from '../src/data/taxonomy.ts';

const root = 'src/content/blog';
const errors = [];
const approvedCounts = {
	basics: 82, prompting: 42, building: 71, clinic: 41, research: 34, tools: 73, society: 51,
	'ACADEMY:course': 25, 'ACADEMY:practice': 1, 'ACADEMY:talks': 1,
};
const counts = Object.fromEntries(Object.keys(approvedCounts).map((id) => [id, 0]));
const folderOf = (filename) => path.posix.dirname(filename);
const addToFolder = (counts, filename) => {
	const folder = folderOf(filename);
	counts[folder] = (counts[folder] ?? 0) + 1;
};
const mappedFolders = Object.create(null);
const actualFolders = Object.create(null);
const mapping = new Map();
for (const row of MAPPING_ROWS) {
	const id = postIdFromPath(row.path);
	addToFolder(mappedFolders, row.path);
	if (mapping.has(id)) errors.push(`Duplicate mapping: ${id}`);
	mapping.set(id, row);
	if (!Object.hasOwn(counts, row.cell)) errors.push(`Unknown cell: ${id} → ${row.cell}`);
	if (![...FORMAT, '강의', '실습·기록'].includes(row.format)) errors.push(`Unknown format: ${id}`);
	if (![...Object.values(LEVELS), '미지정'].includes(row.level)) errors.push(`Unknown level: ${id}`);
}
for (const [cell, expected] of Object.entries(approvedCounts)) {
	if (MAPPING_ROWS.filter((row) => row.cell === cell).length !== expected) errors.push(`Approved count mismatch: ${cell}`);
}

const entries = new Map();
for (const file of readdirSync(root, { recursive: true, withFileTypes: true })) {
	if (!file.isFile() || !/\.(md|mdx)$/.test(file.name)) continue;
	const filename = path.join(file.parentPath, file.name);
	const relative = path.relative(root, filename).split(path.sep).join('/');
	const id = postIdFromPath(relative);
	addToFolder(actualFolders, relative);
	const source = readFileSync(filename, 'utf8');
	const data = load(source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '') ?? {};
	if (entries.has(id)) errors.push(`Duplicate article ID: ${id}`);
	entries.set(id, { id, data });
	const cell = cellOf({ id, data });
	if (!Object.hasOwn(counts, cell)) errors.push(`Unclassified article: ${id}`);
	else counts[cell]++;
	const approved = mapping.get(id);
	if (approved && (approved.path !== relative || approved.old !== data.category || approved.cell !== cell ||
		approved.format !== formatOf({ id, data }) || approved.level !== (LEVELS[levelOf({ id, data })] ?? '미지정'))) {
		errors.push(`Article differs from approved mapping: ${id}`);
	}
	if (!approved && !data.topic) errors.push(`New article requires an explicit topic: ${id}`);
}

for (const folder of new Set([...Object.keys(mappedFolders), ...Object.keys(actualFolders)])) {
	const expected = mappedFolders[folder] ?? 0;
	const actual = actualFolders[folder] ?? 0;
	if (actual !== expected) errors.push(`Folder count mismatch: ${folder} (files ${actual}, mapping ${expected})`);
}
for (const id of mapping.keys()) if (!entries.has(id)) errors.push(`Mapped article missing: ${id}`);
for (const topic of TOPICS) {
	for (const id of topic.featured) {
		const post = entries.get(id);
		if (!post || cellOf(post) !== topic.id || post.data.draft) errors.push(`Invalid featured article: ${id}`);
	}
}
const courseIds = ACADEMY_COURSE.flatMap((part) => part.ids.map((id) => `doctor-ai/${id}`));
const actualCourse = [...entries.values()].filter((post) => cellOf(post) === ACADEMY_CELLS[0]);
if (new Set(courseIds).size !== courseIds.length || courseIds.length !== actualCourse.length ||
	actualCourse.some(({ id }) => !courseIds.includes(id))) errors.push('Doctor AI course inventory differs from the syllabus');

const redirectRows = readFileSync('public/_redirects', 'utf8').split(/\r?\n/)
	.map((line) => line.trim().split(/\s+/)).filter(([from]) => from.startsWith('/blog/category/'));
const wildcard = redirectRows.findIndex(([from]) => from === '/blog/category/:cat');
let exactRedirects = 0;
const directCategories = Object.entries(LEGACY_CATEGORY_ROUTES).filter(([, route]) => route.redirect);
if (directCategories.length !== 14 || wildcard < 0) errors.push('Expected 14 direct categories and the legacy wildcard');
for (const [category, route] of Object.entries(LEGACY_CATEGORY_ROUTES)) {
	for (const suffix of ['', '/']) {
		const from = `/blog/category/${category}${suffix}`;
		const matching = redirectRows.map((row, index) => ({ row, index })).filter(({ row }) => row[0] === from);
		if (!route.redirect) {
			if (matching.length) errors.push(`Split category must keep its legacy listing: ${category}`);
			continue;
		}
		if (matching.length === 1 && matching[0].index < wildcard && matching[0].row[1] === route.redirect &&
			matching[0].row[2] === '301') exactRedirects++;
		else errors.push(`Missing or incorrect 301: ${from}`);
	}
}

const tagKey = (tag) => tag.replace(/\s+/g, '').toLowerCase();
const rawTags = new Set();
const visibleTags = new Set();
const internalTags = new Set();
const labLevels = { beginner: 0, intermediate: 0, advanced: 0, unassigned: 0 };
let articlesWithInternalTags = 0;
for (const post of entries.values()) {
	const original = post.data.tags ?? [];
	const published = publicTags(original);
	const internal = original.filter(isInternalTag);
	original.forEach((tag) => rawTags.add(tag));
	published.forEach((tag) => visibleTags.add(tag));
	internal.forEach((tag) => internalTags.add(tag));
	if (internal.length) articlesWithInternalTags++;
	if (published.length !== new Set(published.map(tagKey)).size ||
		published.some(isInternalTag) || searchableTags(original).split(/\s+/).some(isInternalTag)) {
		errors.push(`Tag display or search leak: ${post.id}`);
	}
	if (!ACADEMY_CELLS.includes(cellOf(post))) labLevels[levelOf(post) ?? 'unassigned']++;
}
for (const [alias, canonical] of TAG_ALIASES) {
	if (!rawTags.has(alias) || !rawTags.has(canonical) || tagKey(alias) !== tagKey(canonical) ||
		publicTags([alias, canonical]).join() !== canonical) {
		errors.push(`Invalid tag alias: ${alias}`);
	}
}
const duplicatePublicTags = visibleTags.size - new Set([...visibleTags].map(tagKey)).size;
if (duplicatePublicTags) errors.push(`${duplicatePublicTags} unmerged public tag spellings`);

console.log(JSON.stringify({
	articles: entries.size, approvedMappings: mapping.size, counts,
	folders: Object.fromEntries(Object.entries(actualFolders).sort(([left], [right]) => left.localeCompare(right))),
	labLevels,
	tags: { raw: rawTags.size, public: visibleTags.size, aliases: TAG_ALIASES.size, internal: internalTags.size,
		articlesWithInternalTags, duplicatePublicTags },
	legacyCategories: Object.keys(LEGACY_CATEGORY_ROUTES).length, exactRedirects,
	courseParts: Object.fromEntries(ACADEMY_COURSE.map(({ label, ids }) => [label, ids.length])),
	errors,
}, null, 2));
if (errors.length) process.exitCode = 1;
