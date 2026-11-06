async function writeClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		const area = document.createElement('textarea');
		area.value = text;
		area.setAttribute('readonly', '');
		area.style.position = 'fixed';
		area.style.left = '-9999px';
		document.body.appendChild(area);
		area.select();
		document.execCommand('copy');
		area.remove();
	}
}

function currentStory(root: HTMLElement): string {
	const button = root.querySelector('[data-story][aria-pressed="true"]');
	return button instanceof HTMLButtonElement ? (button.dataset.story ?? '') : '';
}

function storyPanel(root: HTMLElement, role: string): HTMLElement | null {
	const id = currentStory(root);
	const node = root.querySelector(`[data-story-panel="${CSS.escape(id)}"][data-role="${role}"]`);
	return node instanceof HTMLElement ? node : null;
}

async function recordText(panel: HTMLElement): Promise<string> {
	const files = (panel.dataset.files ?? '').split('|').filter(Boolean);
	const parts: string[] = [];
	for (const file of files) {
		const response = await fetch(file);
		if (!response.ok) throw new Error(file);
		const name = decodeURIComponent(file.split('/').pop() ?? file);
		parts.push(`파일: ${name}\n\n${(await response.text()).trim()}`);
	}
	return parts.join('\n\n----\n\n');
}

export function mountConsultPractice(root: Element | null) {
	if (!(root instanceof HTMLElement)) return;
	const status = root.querySelector('[data-status]');

	function showStory(id: string) {
		for (const panel of root.querySelectorAll('[data-story-panel]')) {
			if (panel instanceof HTMLElement) panel.hidden = panel.dataset.storyPanel !== id;
		}
		for (const button of root.querySelectorAll('[data-story]')) {
			if (button instanceof HTMLButtonElement) {
				button.setAttribute('aria-pressed', button.dataset.story === id ? 'true' : 'false');
			}
		}
	}

	root.addEventListener('click', async (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const storyButton = target.closest('[data-story]');
		if (storyButton instanceof HTMLButtonElement && storyButton.dataset.story) {
			showStory(storyButton.dataset.story);
			document.getElementById('read')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			return;
		}
		const copyButton = target.closest('[data-copy]');
		if (copyButton instanceof HTMLButtonElement) {
			const kind = copyButton.dataset.copy;
			const label = copyButton.textContent ?? '';
			try {
				if (kind === 'prompt') {
					await writeClipboard(storyPanel(root, 'prompt')?.querySelector('[data-prompt]')?.textContent?.trim() ?? '');
				} else if (kind === 'records') {
					const panel = storyPanel(root, 'prompt');
					if (!panel) return;
					if (status) status.textContent = '원문을 읽고 있습니다.';
					await writeClipboard(await recordText(panel));
				} else if (kind === 'check') {
					const lines = [...(storyPanel(root, 'check')?.querySelectorAll('li') ?? [])].map(
						(item) => `- ${item.textContent?.trim() ?? ''}`,
					);
					await writeClipboard(`검산\n${lines.join('\n')}`);
				} else {
					return;
				}
			} catch {
				if (status) status.textContent = '원문을 읽지 못했습니다. 원문 읽기로 연 다음 복사해 주세요.';
				return;
			}
			if (status) status.textContent = '복사했습니다.';
			copyButton.textContent = '복사했습니다';
			window.setTimeout(() => {
				copyButton.textContent = label;
			}, 1600);
			return;
		}
		const opener = target.closest('[data-open-ai]');
		if (!(opener instanceof HTMLAnchorElement)) return;
		event.preventDefault();
		const panel = storyPanel(root, 'prompt');
		if (!panel) return;
		if (status) status.textContent = '지시문과 원문을 복사하고 있습니다.';
		try {
			const prompt = panel.querySelector('[data-prompt]')?.textContent?.trim() ?? '';
			const records = await recordText(panel);
			await writeClipboard(`${prompt}\n\n${records}`);
		} catch {
			if (status) status.textContent = '원문을 읽지 못했습니다. 원문 읽기로 연 다음 복사해 주세요.';
			return;
		}
		if (status) status.textContent = '복사했습니다. 새 대화에 붙여 넣으세요.';
		window.open(opener.href, '_blank', 'noopener');
	});
}
