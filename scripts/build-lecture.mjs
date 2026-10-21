#!/usr/bin/env node
/**
 * build-lecture.mjs — PEOS 강연 자산 빌드 스크립트
 *
 * 내부(비공개) 원본에서 공개용 slides.json 을 생성한다.
 * 발표자 노트(notes)와 내부 전용 필드는 공개 출력에서 완전히 제거한다.
 *
 * 사용법:
 *   node scripts/build-lecture.mjs <lectureId> [--source <path>] [--out <path>]
 *
 * 기본값:
 *   source : private/lectures/<lectureId>/slides.source.json   (.gitignore 처리, 저장소에 커밋 금지)
 *   out    : public/lectures/<lectureId>/slides.json           (공개 배포 — 노트 없음)
 *
 * 원본(source) 슬라이드 스키마(슬라이드 단위 독립 관리):
 *   {
 *     "id":      "KOAT-S01",      // PEOS 자산 ID (유지)
 *     "number":  1,               // 슬라이드 순서
 *     "title":   "...",           // 화면 제목
 *     "image":   "images/..webp", // 이미지 경로 (독립 관리)
 *     "elements":[ ... ],         // 화면 텍스트 요소
 *     "notes":   { ... },         // 발표자 노트 (비공개 — 공개 출력에서 제거)
 *     "public":  true,            // 공개 여부 (기본 true, false 면 공개 json 에서 제외)
 *     "version": "1"              // 수정 버전 (선택, 내부 관리용)
 *   }
 *
 * 공개 출력에 포함되는 필드: id, number, title, image, elements
 * 제거되는 필드: notes, public, version, 그 외 내부 전용 키
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// 공개 출력에서 유지할 화이트리스트 키. 이 외의 모든 키(notes 포함)는 제거된다.
const PUBLIC_SLIDE_KEYS = ['id', 'number', 'title', 'image', 'elements'];

function parseArgs(argv) {
	const args = { _: [] };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--source') args.source = argv[++i];
		else if (a === '--out') args.out = argv[++i];
		else args._.push(a);
	}
	return args;
}

function main() {
	const args = parseArgs(process.argv.slice(2));
	const lectureId = args._[0];
	if (!lectureId) {
		console.error('오류: lectureId 가 필요합니다.\n예: node scripts/build-lecture.mjs koat-ai-2026');
		process.exit(1);
	}

	const sourcePath = resolve(ROOT, args.source || `private/lectures/${lectureId}/slides.source.json`);
	const outPath = resolve(ROOT, args.out || `public/lectures/${lectureId}/slides.json`);
	const notesOutPath = resolve(ROOT, `private/lectures/${lectureId}/notes.json`);
	const imagesDir = resolve(ROOT, `public/lectures/${lectureId}/images`);

	if (!existsSync(sourcePath)) {
		console.error(`오류: 원본 파일을 찾을 수 없습니다: ${sourcePath}`);
		console.error('내부 원본(발표자 노트 포함)은 공개 저장소에 커밋하지 않습니다.');
		process.exit(1);
	}

	const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
	if (!Array.isArray(source)) {
		console.error('오류: 원본 slides 데이터는 배열이어야 합니다.');
		process.exit(1);
	}

	const publicSlides = [];
	const notesIndex = [];
	const warnings = [];

	for (const slide of source) {
		const isPublic = slide.public !== false; // 기본 공개
		// 발표자 노트는 공개 여부와 무관하게 별도 비공개 파일로만 보존
		if (slide.notes && Object.keys(slide.notes).length > 0) {
			notesIndex.push({ id: slide.id, number: slide.number, title: slide.title, notes: slide.notes });
		}
		if (!isPublic) continue;

		const pub = {};
		for (const key of PUBLIC_SLIDE_KEYS) {
			if (slide[key] !== undefined) pub[key] = slide[key];
		}
		// 이미지 존재 확인
		if (pub.image) {
			const imgName = pub.image.replace(/^images\//, '');
			if (!existsSync(join(imagesDir, imgName))) {
				warnings.push(`이미지 누락: ${pub.image} (슬라이드 ${pub.id})`);
			}
		}
		publicSlides.push(pub);
	}

	// 순서 보정 (number 기준, 없으면 원래 순서 유지)
	publicSlides.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

	// 공개 출력에 notes 가 새어나가지 않는지 최종 검증
	const serialized = JSON.stringify(publicSlides);
	if (/"notes"/.test(serialized)) {
		console.error('치명적 오류: 공개 출력에 notes 키가 포함되어 있습니다. 중단합니다.');
		process.exit(1);
	}

	mkdirSync(dirname(outPath), { recursive: true });
	writeFileSync(outPath, JSON.stringify(publicSlides, null, 2) + '\n', 'utf8');

	// 비공개 노트 색인 (저장소에 커밋되지 않는 private/ 경로)
	mkdirSync(dirname(notesOutPath), { recursive: true });
	writeFileSync(notesOutPath, JSON.stringify(notesIndex, null, 2) + '\n', 'utf8');

	console.log(`공개 데이터 생성: ${outPath}`);
	console.log(`  공개 슬라이드: ${publicSlides.length}장 / 원본 ${source.length}장`);
	console.log(`  노트 제거 완료 (공개 출력에 notes 없음)`);
	console.log(`비공개 노트 색인: ${notesOutPath} (${notesIndex.length}장)`);
	if (warnings.length) {
		console.log('\n경고:');
		for (const w of warnings) console.log('  - ' + w);
	}
}

main();
