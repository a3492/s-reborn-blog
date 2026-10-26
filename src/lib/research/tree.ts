export const RESEARCH_AREAS = {
	'multi-ai': {
		id: 'multi-ai',
		slug: 'multi-ai',
		title: 'Multi-AI Operating System',
		notionName: 'Multi-AI Operating System',
		summary: '여러 AI를 하나의 작업 흐름으로 연결하는 실험',
	},
	'human-ai': {
		id: 'human-ai',
		slug: 'human-ai',
		title: 'Human–AI Cognitive Interface',
		notionName: 'Human–AI Cognitive Interface',
		summary: '인간과 AI의 소통 및 인지 구조에 관한 연구',
	},
	workflow: {
		id: 'workflow',
		slug: 'workflow',
		title: 'AI Workflow Engineering',
		notionName: 'AI Workflow Engineering',
		summary: '반복 업무를 지식과 시스템으로 전환하는 방법',
	},
} as const;

export type ResearchAreaId = keyof typeof RESEARCH_AREAS;
export type ResearchStatus = 'draft' | 'in-review' | 'published';

export interface ResearchDocument {
	documentId: string;
	title: string;
	description: string;
	researchArea: ResearchAreaId;
	parentId: string | null;
	relatedIds: string[];
	slug: string;
	status: ResearchStatus;
	order: number;
	version: string;
	publishedAt: string | null;
	updatedAt: string;
}

export interface TreeNode extends ResearchDocument {
	path: string;
	depth: number;
	children: TreeNode[];
	/** Published and every ancestor is published. Only these get a public HTML body. */
	bodyPublic: boolean;
	/** Titles stay visible so unpublished work is not forgotten. */
	titleVisible: boolean;
}

export class ResearchTreeError extends Error {
	code: string;
	details?: unknown;

	constructor(code: string, message: string, details?: unknown) {
		super(message);
		this.name = 'ResearchTreeError';
		this.code = code;
		this.details = details;
	}
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const AREA_IDS = Object.keys(RESEARCH_AREAS) as ResearchAreaId[];

export function notionAreaToId(name: string): ResearchAreaId | null {
	const found = AREA_IDS.find((id) => RESEARCH_AREAS[id].notionName === name);
	return found ?? null;
}

export function statusFromNotion(value: string): ResearchStatus | null {
	if (value === 'Draft') return 'draft';
	if (value === 'In Review') return 'in-review';
	if (value === 'Published') return 'published';
	if (value === 'draft' || value === 'in-review' || value === 'published') return value;
	return null;
}

function sortSiblings(a: TreeNode, b: TreeNode) {
	if (a.order !== b.order) return a.order - b.order;
	return a.title.localeCompare(b.title, 'en');
}

export function validateAndBuild(docs: ResearchDocument[]): {
	roots: TreeNode[];
	byId: Map<string, TreeNode>;
	byPath: Map<string, TreeNode>;
} {
	if (!Array.isArray(docs) || docs.length === 0) {
		throw new ResearchTreeError('empty', 'Research registry has no documents.');
	}

	const byId = new Map<string, ResearchDocument>();
	for (const doc of docs) {
		if (!doc.documentId?.trim()) {
			throw new ResearchTreeError('missing-id', 'A document is missing Document ID.', doc);
		}
		if (byId.has(doc.documentId)) {
			throw new ResearchTreeError('duplicate-id', `Duplicate Document ID: ${doc.documentId}`, doc.documentId);
		}
		if (!SLUG_RE.test(doc.slug)) {
			throw new ResearchTreeError('invalid-slug', `Invalid slug "${doc.slug}" on ${doc.documentId}`, doc);
		}
		if (!(doc.researchArea in RESEARCH_AREAS)) {
			throw new ResearchTreeError('invalid-area', `Unknown research area on ${doc.documentId}`, doc);
		}
		if (doc.parentId === doc.documentId) {
			throw new ResearchTreeError('cycle', `Document ${doc.documentId} is its own parent.`, doc.documentId);
		}
		byId.set(doc.documentId, doc);
	}

	for (const doc of docs) {
		if (doc.parentId && !byId.has(doc.parentId)) {
			throw new ResearchTreeError(
				'missing-parent',
				`Document ${doc.documentId} points at missing parent ${doc.parentId}`,
				{ documentId: doc.documentId, parentId: doc.parentId },
			);
		}
		for (const relatedId of doc.relatedIds) {
			if (!byId.has(relatedId)) {
				throw new ResearchTreeError(
					'missing-related',
					`Document ${doc.documentId} relates to missing ${relatedId}`,
					{ documentId: doc.documentId, relatedId },
				);
			}
		}
	}

	const visiting = new Set<string>();
	const visited = new Set<string>();
	const walkCycle = (id: string) => {
		if (visited.has(id)) return;
		if (visiting.has(id)) {
			throw new ResearchTreeError('cycle', `Cycle detected at ${id}`, [...visiting, id]);
		}
		visiting.add(id);
		const parentId = byId.get(id)?.parentId;
		if (parentId) walkCycle(parentId);
		visiting.delete(id);
		visited.add(id);
	};
	for (const id of byId.keys()) walkCycle(id);

	const childrenOf = new Map<string | null, ResearchDocument[]>();
	for (const doc of docs) {
		const key = doc.parentId;
		const list = childrenOf.get(key) ?? [];
		list.push(doc);
		childrenOf.set(key, list);
	}

	for (const [parentKey, siblings] of childrenOf) {
		const seen = new Map<string, string>();
		for (const sib of siblings) {
			const prior = seen.get(sib.slug);
			if (prior) {
				throw new ResearchTreeError(
					'duplicate-slug',
					`Duplicate slug "${sib.slug}" under ${parentKey ?? 'root'} (${prior}, ${sib.documentId})`,
					{ slug: sib.slug, parentId: parentKey },
				);
			}
			seen.set(sib.slug, sib.documentId);
		}
	}

	const roots: TreeNode[] = [];
	const nodeById = new Map<string, TreeNode>();
	const byPath = new Map<string, TreeNode>();

	const buildNode = (doc: ResearchDocument, parent: TreeNode | null): TreeNode => {
		const depth = parent ? parent.depth + 1 : 0;
		const path = parent ? `${parent.path}${doc.slug}/` : `/research/${doc.slug}/`;
		const ancestorsPublished = parent ? parent.bodyPublic : true;
		const bodyPublic = doc.status === 'published' && ancestorsPublished;
		const node: TreeNode = {
			...doc,
			path,
			depth,
			children: [],
			bodyPublic,
			titleVisible: true,
		};
		if (parent && doc.researchArea !== parent.researchArea) {
			throw new ResearchTreeError(
				'area-mismatch',
				`Document ${doc.documentId} area ${doc.researchArea} does not match parent ${parent.documentId}`,
				doc,
			);
		}
		if (byPath.has(path)) {
			throw new ResearchTreeError('duplicate-path', `Duplicate path ${path}`, path);
		}
		byPath.set(path, node);
		nodeById.set(doc.documentId, node);
		const kids = childrenOf.get(doc.documentId) ?? [];
		node.children = kids.map((child) => buildNode(child, node)).sort(sortSiblings);
		return node;
	};

	const rootDocs = childrenOf.get(null) ?? [];
	const usedRootSlugs = new Set<string>();
	for (const root of rootDocs) {
		if (!AREA_IDS.includes(root.researchArea) || root.slug !== RESEARCH_AREAS[root.researchArea].slug) {
			throw new ResearchTreeError(
				'invalid-root',
				`Root ${root.documentId} must use slug ${RESEARCH_AREAS[root.researchArea].slug}`,
				root,
			);
		}
		if (usedRootSlugs.has(root.slug)) {
			throw new ResearchTreeError('duplicate-root', `Duplicate root slug ${root.slug}`, root);
		}
		usedRootSlugs.add(root.slug);
		roots.push(buildNode(root, null));
	}
	roots.sort(sortSiblings);

	return { roots, byId: nodeById, byPath };
}

export function flatten(nodes: TreeNode[]): TreeNode[] {
	const out: TreeNode[] = [];
	const walk = (list: TreeNode[]) => {
		for (const node of list) {
			out.push(node);
			walk(node.children);
		}
	};
	walk(nodes);
	return out;
}

export function publicPages(nodes: TreeNode[]): TreeNode[] {
	return flatten(nodes).filter((node) => node.bodyPublic);
}

export function nodeByPath(nodes: TreeNode[], path: string): TreeNode | undefined {
	const normalized = path.endsWith('/') ? path : `${path}/`;
	return flatten(nodes).find((node) => node.path === normalized);
}

export function breadcrumbs(node: TreeNode, byId: Map<string, TreeNode>): TreeNode[] {
	const chain: TreeNode[] = [];
	let current: TreeNode | undefined = node;
	while (current) {
		chain.unshift(current);
		current = current.parentId ? byId.get(current.parentId) : undefined;
	}
	return chain;
}

export function relatedNodes(node: TreeNode, byId: Map<string, TreeNode>): TreeNode[] {
	return node.relatedIds.map((id) => byId.get(id)).filter((item): item is TreeNode => Boolean(item));
}
