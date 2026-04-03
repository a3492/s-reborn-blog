/**
 * Add tags to blog posts with missing or empty `tags` in frontmatter.
 * Run: node scripts/add-missing-tags.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BATCH_TAG = "cu2604021805";
const CONTENT_ROOT = path.join(__dirname, "../src/content/blog");

const CATEGORY_EXTRA = {
	"ai-agents": ["에이전트", "의료AI", "LLM"],
	"ai-history": ["AI역사", "의료AI"],
	"ai-terminology": ["AI용어", "용어사전"],
	"clinical-research": ["임상연구", "논문", "EBM"],
	"doctor-dev": ["의사개발자", "Python", "자동화"],
	"medical-data-science": ["의료데이터", "통계", "분석"],
};

function walk(dir) {
	const out = [];
	for (const n of fs.readdirSync(dir, { withFileTypes: true })) {
		const fp = path.join(dir, n.name);
		if (n.isDirectory()) out.push(...walk(fp));
		else if (n.isFile() && n.name.endsWith(".md")) out.push(fp);
	}
	return out;
}

function splitFrontmatter(raw) {
	if (!raw.startsWith("---")) return null;
	const nl = raw[3] === "\r" ? "\r\n" : "\n";
	const rest = raw.slice(3 + nl.length);
	const end = rest.indexOf(nl + "---" + nl);
	if (end === -1) return null;
	const fm = rest.slice(0, end);
	const body = rest.slice(end + nl.length + 4);
	return { fm, body, nl, sep: nl + "---" + nl };
}

function isDraft(fm) {
	const m = fm.match(/^\s*draft:\s*(\S+)/m);
	return m && /^true$/i.test(m[1]);
}

function hasNonemptyTags(fm) {
	if (!/^\s*tags:/m.test(fm)) return false;
	const lines = fm.split(/\r?\n/);
	const i = lines.findIndex((l) => /^\s*tags:/.test(l));
	const same = lines[i].replace(/^\s*tags:\s*/, "").trim();
	if (same && same !== "") {
		if (same === "[]") return false;
		if (same.startsWith("[")) {
			try {
				const j = JSON.parse(same.replace(/'/g, '"'));
				return Array.isArray(j) && j.length > 0;
			} catch {
				return true;
			}
		}
		return true;
	}
	let count = 0;
	for (let j = i + 1; j < lines.length; j++) {
		const l = lines[j];
		if (/^\s*-\s+/.test(l)) count++;
		else if (l.trim() === "") continue;
		else if (/^\S/.test(l)) break;
		else if (/^\s+\w+:/.test(l)) break;
	}
	return count > 0;
}

function getCategory(fm) {
	const m = fm.match(/^\s*category:\s*(\S+)/m);
	return m ? m[1].replace(/['"]/g, "") : "";
}

function slugHint(relPath) {
	return relPath.replace(/\.md$/, "").split("/").pop() || "post";
}

function buildTagsBlock(nl, category, relPath) {
	const extras = CATEGORY_EXTRA[category] || ["블로그", "의료AI"];
	const hint = slugHint(relPath);
	const all = [BATCH_TAG, ...extras, hint];
	let s = `tags:${nl}`;
	for (const t of all) {
		s += `  - "${t.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"${nl}`;
	}
	return s;
}

function insertTagsAfterCategory(fm, nl, category, relPath) {
	const tagsBlock = buildTagsBlock(nl, category, relPath);
	let cleaned = fm.replace(/^\s*tags:\s*\[\s*\]\s*\r?\n?/m, "");
	if (/^\s*tags:/m.test(cleaned)) return null;
	const catRe = /^(\s*category:\s*.+)$/m;
	if (catRe.test(cleaned)) {
		return cleaned.replace(catRe, (_, line) => `${line}${nl}${tagsBlock}`);
	}
	const titleRe = /^(\s*title:\s*.+)$/m;
	if (titleRe.test(cleaned)) {
		return cleaned.replace(titleRe, (_, line) => `${line}${nl}${tagsBlock}`);
	}
	return `${tagsBlock}${cleaned}`;
}

function main() {
	const files = walk(CONTENT_ROOT);
	let updated = 0;
	for (const abs of files) {
		const raw = fs.readFileSync(abs, "utf8");
		const sp = splitFrontmatter(raw);
		if (!sp) continue;
		if (isDraft(sp.fm)) continue;
		if (hasNonemptyTags(sp.fm)) continue;

		const rel = path.relative(CONTENT_ROOT, abs).replace(/\\/g, "/");
		const cat = getCategory(sp.fm);
		const nextFm = insertTagsAfterCategory(sp.fm, sp.nl, cat, rel);
		if (nextFm == null) {
			console.warn("skip:", rel);
			continue;
		}
		const out = `---${sp.nl}${nextFm}${sp.sep}${sp.body}`;
		fs.writeFileSync(abs, out, "utf8");
		updated++;
	}
	console.log("updated:", updated);
}

main();
