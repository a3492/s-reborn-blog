/** Display aliases for spelling variants in the current corpus. */
export const TAG_ALIASES = new Map([
	['AI에이전트', 'AI 에이전트'],
	['ai', 'AI'],
	['faq', 'FAQ'],
	['chatgpt', 'ChatGPT'],
	['claude', 'Claude'],
	['의료AI', '의료 AI'],
	['학습데이터', '학습 데이터'],
	['llm', 'LLM'],
	['gpt', 'GPT'],
	['rag', 'RAG'],
	['hallucination', 'Hallucination'],
	['agent', 'Agent'],
	['xai', 'xAI'],
	['chain-of-thought', 'Chain-of-Thought'],
	['cot', 'CoT'],
	['Fine-tuning', 'fine-tuning'],
	['병원AI', '병원 AI'],
	['AI활용', 'AI 활용'],
	['temperature', 'Temperature'],
	['zero-shot', 'Zero-shot'],
	['few-shot', 'Few-shot'],
	['human-in-the-loop', 'Human-in-the-loop'],
	['FunctionCalling', 'Function Calling'],
]);

/** Keep workflow provenance out of public tags, including the old bare CU marker. */
export const isInternalTag = (tag: string) => /^#?(?:cu(?:\d+)?|cl\d{10}(?:\d{2})?)$/i.test(tag.trim());

export function publicTags(tags: readonly string[] = []): string[] {
	const visible = tags.map((tag) => tag.trim()).filter((tag) => tag && !isInternalTag(tag));
	return [...new Set(visible.map((tag) => TAG_ALIASES.get(tag) ?? tag))];
}

export function searchableTags(tags: readonly string[] = []): string {
	// Keep legacy spellings searchable while indexing the display spelling as well.
	const visible = publicTags(tags);
	const canonical = new Set(visible);
	return [...visible, ...[...TAG_ALIASES].filter(([, tag]) => canonical.has(tag)).map(([alias]) => alias)].join(' ');
}
