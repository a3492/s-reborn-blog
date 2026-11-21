export function initTaxonomyListing(root: HTMLElement) {
	const cards = [...root.querySelectorAll<HTMLElement>('[data-taxonomy-post]')];
	const filters = root.querySelector<HTMLElement>('#blog-filters')!;
	const count = root.querySelector('[data-taxonomy-count]')!;
	const title = root.querySelector('#blog-content-title')!;
	const empty = root.querySelector<HTMLElement>('[data-taxonomy-empty]')!;
	const intro = root.querySelector<HTMLElement>('[data-taxonomy-intro]');
	const grid = root.querySelector('[data-taxonomy-grid]')!;
	const legacy: {
		categories: Record<string, string>;
		groups: Record<string, { label: string; cats: string[] }>;
	} | null = JSON.parse(root.querySelector('[data-legacy-blog]')?.textContent ?? 'null');
	const pageTitle = title.textContent;
	const facets = [...filters.querySelectorAll<HTMLElement>('[data-facet]')];

	const CONCEPT_MAP: Record<string, string[]> = {
		'입문':     ['beginner','초보','기초','처음','시작','도구소개','쉬운','faq','설치'],
		'초보':     ['beginner','입문','기초','처음','쉬운','시작'],
		'기초':     ['beginner','입문','초보','기본','처음'],
		'쉬운':     ['beginner','입문','초보','기초','간단'],
		'시작':     ['beginner','입문','초보','설치','처음'],
		'처음':     ['beginner','입문','초보','기초','시작'],
		'심화':     ['advanced','고급','전문','intermediate'],
		'고급':     ['advanced','심화','전문'],
		'중급':     ['intermediate','중간'],
		'전문':     ['advanced','심화','고급','의료'],
		'비용':     ['무료','유료','가격','요금','api','구독','결제','cost'],
		'무료':     ['free','비용','가격','요금'],
		'가격':     ['비용','무료','유료','요금','구독'],
		'유료':     ['비용','가격','결제','구독'],
		'돈':       ['비용','가격','요금','무료','유료'],
		'요금':     ['비용','가격','무료','유료','구독'],
		'구독':     ['비용','가격','유료','결제','플랜'],
		'법':       ['법적','법률','의료법','규정','합법','책임','허가'],
		'법적':     ['법','법률','의료법','규정','합법','책임'],
		'법률':     ['법','법적','의료법','규정','책임'],
		'규정':     ['법','법적','법률','의료법','허가'],
		'책임':     ['법적','의사','오류','과실','법률'],
		'윤리':     ['법적','도덕','책임','동의','허가','환자'],
		'보안':     ['개인정보','데이터','보호','gdpr','암호화'],
		'개인정보': ['보안','데이터','보호','gdpr','환자'],
		'데이터':   ['개인정보','보안','보호','환자','의료'],
		'진단':     ['ai','의료','의사','임상','병원'],
		'의사':     ['의료','임상','진료','병원','처방'],
		'병원':     ['의료','임상','의사','진료'],
		'환자':     ['의료','임상','진료','개인정보'],
		'도구':     ['툴','소프트웨어','ai','앱','플랫폼'],
		'설치':     ['install','셋업','시작','준비'],
		'ai':       ['인공지능','llm','gpt','claude','생성형'],
		'자동화':   ['workflow','파이프라인','에이전트','오케스트레이션'],
		'글쓰기':   ['문서','기록','작성','노트','보고서'],
		'요약':     ['정리','분석','추출','핵심'],
		'코딩':     ['개발','프로그래밍','코드','소프트웨어'],
		'개발':     ['코딩','프로그래밍','소프트웨어','앱'],
		'터미널':   ['cli','명령어','설치','개발'],
	};

	function expandQuery(query: string): string[] {
		const q = query.toLowerCase().trim();
		const terms = new Set([q]);
		for (const [key, synonyms] of Object.entries(CONCEPT_MAP)) {
			const k = key.toLowerCase();
			if (q.includes(k) || k.includes(q)) {
				synonyms.forEach(s => terms.add(s.toLowerCase()));
				terms.add(k);
			}
			if (synonyms.some(s => { const sl = s.toLowerCase(); return q.includes(sl) || sl.includes(q); })) {
				terms.add(k);
				synonyms.forEach(s => terms.add(s.toLowerCase()));
			}
		}
		return [...terms];
	}

	function detectIntent(query: string): string | null {
		const q = query.toLowerCase();
		if (['입문','초보','기초','쉬운','처음','시작','beginner'].some(t => q.includes(t))) return 'beginner';
		if (['심화','고급','전문','advanced'].some(t => q.includes(t))) return 'advanced';
		if (['중급','intermediate'].some(t => q.includes(t))) return 'intermediate';
		return null;
	}

	function scoreCard(card: HTMLElement, terms: string[], intent: string | null): number {
		const title = (card.dataset.title ?? '').toLowerCase();
		const desc  = (card.dataset.desc ?? '').toLowerCase();
		const tags  = (card.dataset.tags ?? '').toLowerCase();
		const diff  = card.dataset.difficulty ?? '';
		const taxonomy = [card.dataset.cat, card.dataset.topic, card.dataset.format, card.dataset.label].join(' ').toLowerCase();
		let score = 0;
		for (const term of terms) {
			if (title.includes(term)) score += 10;
			if (tags.includes(term))  score += 8;
			if (desc.includes(term))  score += 5;
			if (taxonomy.includes(term))   score += 3;
		}
		if (intent && diff === intent) score += 15;
		return score;
	}


	function render() {
		const params = new URLSearchParams(location.search);
		const query = params.get('q')?.trim() ?? '';
		const category = params.get('category') ?? '';
		const groupId = params.get('group') ?? '';
		const group = legacy && Object.hasOwn(legacy.groups, groupId) ? legacy.groups[groupId] : undefined;
		const categoryLabel = legacy && Object.hasOwn(legacy.categories, category) ? legacy.categories[category] : undefined;
		const courseList = !query && !group && category === 'doctor-ai' && Boolean(categoryLabel);
		filters.hidden = courseList;
		const selected = Object.fromEntries(facets.map((facet) => {
			const name = facet.dataset.facet!;
			const value = params.get(name) ?? '';
			const buttons = [...facet.querySelectorAll<HTMLButtonElement>('button')];
			const active = buttons.some((button) => button.dataset.value === value) ? value : '';
			buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.value === active)));
			return [name, active];
		}));

		const terms = query ? expandQuery(query) : [];
		const intent = query ? detectIntent(query) : null;
		let visible = 0;
		const ranked: { card: HTMLElement; score: number }[] = [];
		for (const card of cards) {
			const { cat, topic, format, difficulty } = card.dataset;
			const inScope = query || (group ? group.cats.includes(cat ?? '') : categoryLabel ? cat === category : topic);
			const score = query ? scoreCard(card, terms, intent) : 1;
			card.hidden = !inScope || score === 0 ||
				Boolean(!courseList && selected.format && format !== selected.format) ||
				Boolean(!courseList && selected.level && difficulty !== selected.level);
			if (!card.hidden) {
				visible++;
				if (query) ranked.push({ card, score });
			}
		}
		ranked.sort((a, b) => b.score - a.score).forEach(({ card }) => grid.append(card));
		title.textContent = query ? `"${query}" 검색 결과` : group?.label ?? categoryLabel ?? pageTitle;
		count.textContent = `${visible}편`;
		empty.hidden = visible !== 0;
		if (intro) intro.hidden = Boolean(query || group || categoryLabel || selected.format || selected.level);
	}

	filters.addEventListener('click', (event) => {
		const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-value]');
		const facet = button?.closest<HTMLElement>('[data-facet]')?.dataset.facet;
		if (!button || !facet) return;
		const url = new URL(location.href);
		const value = button.dataset.value;
		if (value) url.searchParams.set(facet, value);
		else url.searchParams.delete(facet);
		history.pushState(null, '', url);
		render();
	});
	render();
	window.addEventListener('popstate', render);
}
