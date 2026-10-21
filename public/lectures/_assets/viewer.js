/*
 * PEOS 재사용 강연 뷰어 (공개용)
 *
 * 원본 웹 프레젠테이션의 렌더링/탐색 동작을 보존한다.
 * - 1333.333 × 750 (16:9) 무대, 화면 폭에 맞춰 scale
 * - 이전/다음, 키보드 방향키, 전체화면, 전체 슬라이드 목차
 * - 개별 슬라이드 직접 링크 (#slide-N 또는 #KOAT-SNN)
 *
 * 공개 데이터(slides.json)에는 발표자 노트가 포함되지 않는다.
 * 이 뷰어에는 노트를 표시하는 코드가 존재하지 않는다.
 *
 * 설정: 루트 엘리먼트(.lec-viewer)의 data-slides 속성으로 데이터 경로 지정.
 */
(function () {
	const root = document.querySelector('.lec-viewer');
	if (!root) return;
	const slidesPath = root.dataset.slides || 'slides.json';
	const slidesUrl = new URL(slidesPath, location.href);

	let slides = [];
	let idx = 0;

	const $ = (s) => document.querySelector(s);
	const shell = $('#shell');
	const stage = $('#stage');

	function fit() {
		stage.style.transform = `scale(${shell.clientWidth / 1333.333})`;
	}
	addEventListener('resize', fit);

	function resolveImg(src) {
		try {
			return new URL(src, slidesUrl).href;
		} catch {
			return src;
		}
	}

	function go(n) {
		idx = Math.max(0, Math.min(slides.length - 1, n));
		const s = slides[idx];
		const last = slides.length - 1;
		const layer = $('#layer');
		layer.innerHTML = '';

		const im = document.createElement('img');
		im.className = 'hero-img';
		im.src = resolveImg(s.image);
		im.alt = s.title + ' 관련 삽화';
		layer.append(im);
		if (idx === 0 || idx === last) {
			im.style.left = '746px';
			im.style.top = '138px';
		}

		for (const e of s.elements) {
			const d = document.createElement('div');
			d.className = 'text';
			d.textContent = e.text;
			Object.assign(d.style, {
				left: e.x * 100 + 'px',
				top: e.y * 100 + 'px',
				width: e.w * 100 + 'px',
				minHeight: e.h * 100 + 'px',
				fontSize: (e.size * 100) / 72 + 'px',
				fontWeight: e.bold ? '700' : '400',
				textAlign: e.align,
				color: '#173a55',
			});
			if (e.size >= 26) d.style.fontWeight = '750';
			if (e.y < 0.7 || e.y > 7) d.style.color = '#6e869b';
			if (e.y > 1 && e.y < 1.9 && e.size < 20) d.style.color = '#0095b3';
			layer.append(d);
		}

		if (idx > 0 && idx < last) {
			for (const cls of ['top', 'bottom']) {
				const d = document.createElement('div');
				d.className = 'rule ' + cls;
				layer.append(d);
			}
			for (const y of [4.3, 4.98, 5.66]) {
				const d = document.createElement('div');
				d.className = 'bullet';
				d.style.left = '77px';
				d.style.top = y * 100 + 'px';
				layer.append(d);
			}
		}

		$('#counter').textContent = `${idx + 1} / ${slides.length}`;
		$('#title').textContent = s.title;
		$('#chapter').textContent = s.id;
		$('#progress').style.width = ((idx + 1) / slides.length) * 100 + '%';
		$('#prev').disabled = idx === 0;
		$('#next').disabled = idx === last;
		// 개별 슬라이드 직접 링크 (slide-N 형식 유지)
		history.replaceState(null, '', '#slide-' + (idx + 1));
		fit();
	}

	$('#prev').onclick = () => go(idx - 1);
	$('#next').onclick = () => go(idx + 1);
	$('#overview').onclick = () => ($('#overviewPane').hidden = false);
	$('#closeOverview').onclick = () => ($('#overviewPane').hidden = true);
	$('#fullBtn').onclick = () => {
		if (!document.fullscreenElement) shell.requestFullscreen?.();
		else document.exitFullscreen?.();
	};

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			$('#overviewPane').hidden = true;
			return;
		}
		if (!$('#overviewPane').hidden) return;
		if (e.key === 'ArrowRight' || e.key === 'PageDown') go(idx + 1);
		if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(idx - 1);
		if (e.key.toLowerCase() === 'f') $('#fullBtn').click();
	});

	// 해시로 초기 슬라이드 해석: #slide-3 또는 #KOAT-S03
	function initialIndex() {
		const h = location.hash.replace(/^#/, '');
		if (!h) return 0;
		const m = h.match(/^slide-(\d+)$/i);
		if (m) return Number(m[1]) - 1;
		const byId = slides.findIndex((s) => s.id && s.id.toLowerCase() === h.toLowerCase());
		if (byId >= 0) return byId;
		return 0;
	}

	fetch(slidesUrl)
		.then((r) => {
			if (!r.ok) throw new Error('slides.json 로드 실패: ' + r.status);
			return r.json();
		})
		.then((data) => {
			slides = data;
			const c = $('#cards');
			slides.forEach((s, i) => {
				const b = document.createElement('button');
				b.className = 'card';
				const im = document.createElement('img');
				im.src = resolveImg(s.image);
				im.loading = 'lazy';
				im.alt = s.title + ' 썸네일';
				const small = document.createElement('small');
				small.textContent = `${i + 1} / ${slides.length}`;
				const strong = document.createElement('strong');
				strong.textContent = s.title;
				b.append(im, small, strong);
				b.onclick = () => {
					go(i);
					$('#overviewPane').hidden = true;
				};
				c.append(b);
			});
			go(initialIndex());
		})
		.catch((err) => {
			const t = $('#title');
			if (t) t.textContent = '슬라이드를 불러오지 못했습니다.';
			console.error(err);
		});
})();
