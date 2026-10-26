import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { flatten, publicPages, validateAndBuild, type ResearchDocument } from '../../src/lib/research/tree.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function main() {
	const registry = JSON.parse(await readFile(path.join(root, 'src/data/research-registry.json'), 'utf8'));
	const { roots, byPath } = validateAndBuild(registry.documents as ResearchDocument[]);
	const published = publicPages(roots);
	const files = new Set((await readdir(path.join(root, 'src/content/research'))).filter((name) => name.endsWith('.mdx')));
	const missing = published.filter((node) => !files.has(`${node.documentId}.mdx`));
	if (missing.length) {
		throw new Error(`Published docs missing MDX: ${missing.map((node) => node.documentId).join(', ')}`);
	}
	const extra = [...files].filter((name) => !published.some((node) => `${node.documentId}.mdx` === name));
	if (extra.length) {
		throw new Error(`MDX without a public page: ${extra.join(', ')}`);
	}
	const paths = published.map((node) => node.path);
	if (new Set(paths).size !== paths.length) throw new Error('Duplicate public paths');
	for (const node of flatten(roots)) {
		if (node.status !== 'published' && published.some((item) => item.documentId === node.documentId)) {
			throw new Error(`${node.documentId} is unpublished but public`);
		}
	}
	console.log(`QA ok: ${published.length} public pages, ${flatten(roots).length} titles, ${byPath.size} paths.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
