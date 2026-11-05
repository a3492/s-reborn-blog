export function renderConsultMarkdown(markdown: string): string {
	const escape = (value: string) =>
		value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	const inline = (value: string) =>
		escape(value)
			.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			.replace(/`([^`]+)`/g, '<code>$1</code>');
	const chunks: string[] = [];
	markdown.replace(/\r\n/g, '\n').split('```').forEach((block, index) => {
		if (index % 2 === 1) {
			const code = block.replace(/^[a-zA-Z]*\n/, '').replace(/\n$/, '');
			chunks.push(`<pre><code>${escape(code)}</code></pre>`);
			return;
		}
		const lines = block.split('\n');
		let html = '';
		let list: string[] | null = null;
		const flush = () => {
			if (!list) return;
			html += `<ul>${list.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`;
			list = null;
		};
		for (const line of lines) {
			if (/^\s*[-*]\s+/.test(line)) {
				list ??= [];
				list.push(line.replace(/^\s*[-*]\s+/, ''));
				continue;
			}
			flush();
			if (!line.trim()) continue;
			if (line.startsWith('### ')) html += `<h3>${inline(line.slice(4))}</h3>`;
			else if (line.startsWith('## ')) html += `<h2>${inline(line.slice(3))}</h2>`;
			else if (line.startsWith('# ')) html += `<h2>${inline(line.slice(2))}</h2>`;
			else if (line.startsWith('> ')) html += `<blockquote><p>${inline(line.slice(2))}</p></blockquote>`;
			else if (line.trim() === '---') html += '<hr />';
			else html += `<p>${inline(line)}</p>`;
		}
		flush();
		chunks.push(html);
	});
	return chunks.join('');
}
