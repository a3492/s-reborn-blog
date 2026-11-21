import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import {
	ACADEMY_CELLS, ACADEMY_COURSE, FORMAT, LEVELS, MAPPING_ROWS, TOPICS,
	cellOf, formatOf, levelOf, postIdFromPath,
} from '../src/data/taxonomy.ts';

const root = 'src/content/blog';
const errors = [];
const approvedCounts = {
	basics: 82, prompting: 42, building: 71, clinic: 41, research: 34, tools: 73, society: 51,
	'ACADEMY:course': 25, 'ACADEMY:practice': 1, 'ACADEMY:talks': 1,
};
const counts = Object.fromEntries(Object.keys(approvedCounts).map((id) => [id, 0]));
const mapping = new Map();
for (const row of MAPPING_ROWS) {
	const id = postIdFromPath(row.path);
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

console.log(JSON.stringify({
	articles: entries.size, approvedMappings: mapping.size, counts,
	courseParts: Object.fromEntries(ACADEMY_COURSE.map(({ label, ids }) => [label, ids.length])),
	errors,
}, null, 2));
if (errors.length) process.exitCode = 1;
