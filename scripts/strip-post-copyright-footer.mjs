/**
 * Removes trailing horizontal rule + italic site line from blog markdown bodies.
 * Run: node scripts/strip-post-copyright-footer.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/content/blog");

function walk(dir) {
	const out = [];
	for (const n of fs.readdirSync(dir, { withFileTypes: true })) {
		const fp = path.join(dir, n.name);
		if (n.isDirectory()) out.push(...walk(fp));
		else if (n.isFile() && n.name.endsWith(".md")) out.push(fp);
	}
	return out;
}

const reBlock =
	/\r?\n---\s*\r?\n\*© S-Reborn (?:clinic|Blog|AI Blog) \| s-reborn-blog\.pages\.dev\*\s*$/;
const reLine =
	/\r?\n\*© S-Reborn (?:clinic|Blog|AI Blog) \| s-reborn-blog\.pages\.dev\*\s*$/;

let n = 0;
for (const f of walk(root)) {
	let s = fs.readFileSync(f, "utf8");
	const next = s.replace(reBlock, "").replace(reLine, "");
	if (next !== s) {
		fs.writeFileSync(f, next, "utf8");
		n++;
	}
}
console.log("stripped", n, "files");
