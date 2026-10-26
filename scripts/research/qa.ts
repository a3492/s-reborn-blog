import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sampleDocuments } from '../../src/lib/research/fixtures/sample.ts';
import {
	flatten,
	publicPages,
	publicTree,
	validateAndBuild,
	type ResearchDocument,
} from '../../src/lib/research/tree.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function main() {
	const { roots: sampleTree } = validateAndBuild(sampleDocuments);
	const samplePublic = publicPages(sampleTree);
	if (samplePublic.length !== 1 || samplePublic[0]?.documentId !== 'sample-published') {
		throw new Error('Fixture must expose exactly one published document');
	}
	if (flatten(publicTree(sampleTree)).some((node) => node.documentId === 'sample-unpublished')) {
		throw new Error('Unpublished fixture leaked into the public tree');
	}

	const registry = JSON.parse(await readFile(path.join(root, 'src/data/research-registry.json'), 'utf8'));
	const docs = registry.documents as ResearchDocument[];
	if (docs.some((doc) => doc.status !== 'published')) {
		throw new Error('Registry must contain published documents only');
	}
	const { roots, byPath } = validateAndBuild(docs);
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
	if (new Set(published.map((node) => node.path)).size !== published.length) {
		throw new Error('Duplicate public paths');
	}
	console.log(
		`QA ok: fixture hid unpublished, ${published.length} public pages, ${flatten(roots).length} registry docs, ${byPath.size} paths.`,
	);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
