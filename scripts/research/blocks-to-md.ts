type NotionRichText = {
	plain_text?: string;
	annotations?: { code?: boolean; bold?: boolean; italic?: boolean; strikethrough?: boolean };
	href?: string | null;
	equation?: { expression?: string };
};

type NotionBlock = {
	id: string;
	type: string;
	has_children?: boolean;
	[key: string]: unknown;
};

function escapeMd(text: string) {
	return text.replace(/([\\`*_[\]#])/g, '\\$1');
}

function inline(texts: NotionRichText[] = []) {
	return texts
		.map((item) => {
			if (item.equation?.expression) return `$${item.equation.expression}$`;
			let value = item.plain_text ?? '';
			if (item.href) value = `[${value}](${item.href})`;
			else value = escapeMd(value);
			if (item.annotations?.code) value = `\`${item.plain_text ?? ''}\``;
			if (item.annotations?.bold) value = `**${value}**`;
			if (item.annotations?.italic) value = `*${value}*`;
			if (item.annotations?.strikethrough) value = `~~${value}~~`;
			return value;
		})
		.join('');
}

function rich(block: NotionBlock, key: string): NotionRichText[] {
	const payload = block[key] as { rich_text?: NotionRichText[] } | undefined;
	return payload?.rich_text ?? [];
}

export async function blocksToMarkdown(
	blocks: NotionBlock[],
	opts: {
		loadChildren: (id: string) => Promise<NotionBlock[]>;
		rewriteImage: (url: string, blockId: string) => Promise<string>;
	},
): Promise<string> {
	const lines: string[] = [];
	for (const block of blocks) {
		const type = block.type;
		if (type === 'paragraph') lines.push(inline(rich(block, 'paragraph')), '');
		else if (type === 'heading_1') lines.push(`# ${inline(rich(block, 'heading_1'))}`, '');
		else if (type === 'heading_2') lines.push(`## ${inline(rich(block, 'heading_2'))}`, '');
		else if (type === 'heading_3') lines.push(`### ${inline(rich(block, 'heading_3'))}`, '');
		else if (type === 'bulleted_list_item') lines.push(`- ${inline(rich(block, 'bulleted_list_item'))}`);
		else if (type === 'numbered_list_item') lines.push(`1. ${inline(rich(block, 'numbered_list_item'))}`);
		else if (type === 'quote') lines.push(`> ${inline(rich(block, 'quote'))}`, '');
		else if (type === 'callout') lines.push(`> ${inline(rich(block, 'callout'))}`, '');
		else if (type === 'code') {
			const payload = block.code as { rich_text?: NotionRichText[]; language?: string };
			lines.push('```' + (payload.language ?? ''), (payload.rich_text ?? []).map((t) => t.plain_text ?? '').join(''), '```', '');
		} else if (type === 'equation') {
			const expr = (block.equation as { expression?: string })?.expression ?? '';
			lines.push(`<div class="research-math" data-display="true">${expr}</div>`, '');
		} else if (type === 'divider') lines.push('---', '');
		else if (type === 'image') {
			const payload = block.image as { type?: string; file?: { url?: string }; external?: { url?: string }; caption?: NotionRichText[] };
			const raw = payload.file?.url || payload.external?.url || '';
			const src = raw ? await opts.rewriteImage(raw, block.id) : '';
			const caption = inline(payload.caption ?? []);
			if (src) lines.push(`![${caption}](${src})`, '');
		} else if (type === 'table') {
			if (block.has_children) {
				const rows = await opts.loadChildren(block.id);
				const cells = rows.map((row) => {
					const content = row.table_row as { cells?: NotionRichText[][] };
					return (content.cells ?? []).map((cell) => inline(cell).replace(/\|/g, '\\|'));
				});
				if (cells[0]) {
					lines.push(`| ${cells[0].join(' | ')} |`);
					lines.push(`| ${cells[0].map(() => '---').join(' | ')} |`);
					for (const row of cells.slice(1)) lines.push(`| ${row.join(' | ')} |`);
					lines.push('');
				}
			}
		} else if (type === 'bookmark' || type === 'link_preview') {
			const url = (block[type] as { url?: string })?.url;
			if (url) lines.push(`[${url}](${url})`, '');
		} else if (block.has_children) {
			const nested = await opts.loadChildren(block.id);
			lines.push(await blocksToMarkdown(nested, opts));
		}
	}
	return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
