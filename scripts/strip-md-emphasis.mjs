/**
 * Strip **bold** and *italic* outside fenced ``` blocks.
 * Skips list lines like "* item" (asterisk + space) via italic pattern requiring \S after opening *.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogRoot = path.join(__dirname, '../src/content/blog');

function walkMd(dir, out = []) {
	for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, ent.name);
		if (ent.isDirectory()) walkMd(p, out);
		else if (ent.name.endsWith('.md')) out.push(p);
	}
	return out;
}

function stripOutsideFences(chunk) {
	let s = chunk;
	for (let i = 0; i < 40; i++) {
		const n = s.replace(/\*\*([^*]+)\*\*/g, '$1');
		if (n === s) break;
		s = n;
	}
	for (let i = 0; i < 40; i++) {
		// *italic* but not **; first char after * must be non-space (excludes "* list")
		const n = s.replace(/\*(\S[^*\n]*?)\*(?!\*)/g, '$1');
		if (n === s) break;
		s = n;
	}
	return s;
}

function processFile(filePath) {
	const raw = fs.readFileSync(filePath, 'utf8');
	const parts = raw.split(/(```[\s\S]*?```)/g);
	const next = parts.map((part, i) => (i % 2 === 1 ? part : stripOutsideFences(part))).join('');
	if (next === raw) return false;
	fs.writeFileSync(filePath, next, 'utf8');
	return true;
}

const files = walkMd(blogRoot);
let changed = 0;
for (const f of files) {
	if (processFile(f)) changed++;
}
console.log(`strip-md-emphasis: ${files.length} files, ${changed} updated.`);
