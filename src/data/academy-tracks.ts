export const ACADEMY_TRACKS = [
	{
		id: 'intro',
		label: '입문',
		blurb: '프로그램이 만드는 것과, 의사가 보고 결정하는 것의 경계.',
	},
	{
		id: 'clinic',
		label: '진료 활용',
		blurb: '외래 한 바퀴, 기록, 영상, 약, 그리고 한 번으로 끝나지 않는 진료.',
	},
	{
		id: 'practice',
		label: '실습',
		blurb: '질문 문장, 환자가 읽는 글, 도구를 고르는 눈, 넣으면 안 되는 것.',
	},
	{
		id: 'advanced',
		label: '심화',
		blurb: '의료기기와 버전, 전문과 화면, 논문을 만드는 오후.',
	},
] as const;

export type AcademyTrackId = (typeof ACADEMY_TRACKS)[number]['id'];

export function academyTrack(id: string) {
	return ACADEMY_TRACKS.find((track) => track.id === id);
}
