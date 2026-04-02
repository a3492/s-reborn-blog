/**
 * 기획서(서사·테제·페이오프)에 맞춰 orchestration 글에 공통 블록 삽입.
 * 이미 ### 테제 가 있으면 스킵.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../src/content/blog/orchestration");

/** @type {Record<string, { thesis: string; stake: string; turn: string; payoff: string; hook: string; read_time?: number; desc?: string; takeaway1: string }>} */
const P = {
	"task-decomposition.md": {
		thesis: "**태스크 분해가 엉망이면, 아무리 좋은 모델을 써도 RoundPrep은 “한 방에 다 해줘” 지옥으로 돌아간다.**",
		stake: "화이트보드에 적힌 단어가 네 개뿐일 때, 서진·혜준이 가장 오래 붙잡는 건 **“무엇을 한 번에 시키지 않을 것인가”**다. 여기서 못 자르면 나중에 로그도, 승인도 없다.",
		turn: "v0.1에서 흔한 사고: “환자 한 명 요약”을 한 태스크로 몰아넣어 **어느 단계에서 틀렸는지** 아무도 모른다. 분해는 디버깅을 위한 설계다.",
		payoff: "**혜준:** “오늘부터 화이트보드엔 **출력 형식**부터 씁시다. 한 태스크는 출력 하나, 의존성은 화살표.”",
		hook: "태스크가 잘려 나갔다. 이제 그 조각들을 **어떤 패턴**으로 엮을지 — [AI 워크플로우 패턴 5가지](/blog/orchestration/workflow-patterns/)",
		read_time: 12,
		desc: "RoundPrep 제3화. 화이트보드에 ‘회진 준비’만 있을 때, 먼저 잘라내야 할 것은 모델이 아니라 태스크다.",
		takeaway1: "내일 회의에서: \"한 태스크는 출력 하나. '다 해줘'는 설계가 아니라 사고입니다.\"",
	},
	"workflow-patterns.md": {
		thesis: "**패턴을 고르지 않고 코드부터 쓰면, RoundPrep은 if문 유적지가 된다.**",
		stake: "박과장은 다이어그램을 원한다. 서진은 **“이게 순차야 병렬이야?”**를 한 마디로 말할 수 있어야 한다.",
		turn: "팀이 처음 고른 “순차 파이프라인”이 야간 알림 분기에서 깨졌다. 그때 **슈퍼바이저·그래프** 이야기가 나온다.",
		payoff: "**서진:** “우리는 지금 **패턴 이름**부터 합의하고 코드는 그다음에 갑시다.”",
		hook: "패턴이 정해졌다면 **동시에 긁을 수 있는 것**부터 줄인다 — [병렬 실행](/blog/orchestration/parallel-execution/)",
		read_time: 13,
		desc: "RoundPrep 제4화. 순차·병렬·슈퍼바이저·그래프 중 무엇을 쓸지, 회의에서 이름을 붙이지 않으면 끝이 없다.",
		takeaway1: "회의실에서 패턴 이름(순차·지휘·그래프)을 먼저 찍으면, 코드 논쟁이 짧아진다.",
	},
	"parallel-execution.md": {
		thesis: "**병렬은 빠르게 해주지만, 의존성을 무시하면 레이스와 중복 호출로 터진다.**",
		stake: "환자 열 명 × 데이터 네 소스. 순차면 수십 초, 병렬면 **몇 초**로 줄어든다. 서진의 아침이 걸려 있다.",
		turn: "샌드박스에서 Lab과 투약을 동시에 긁었는데, 한쪽 API가 레이트 리밋으로 죽었다. **재시도 정책 없는 병렬**은 폭탄이다.",
		payoff: "**혜준:** “병렬은 **독립 태스크만**. 의존 있는 건 화이트보드에 빨간 줄.”",
		hook: "병렬로 동시에 돌린 결과를 **어디에 쌓을지**가 다음 전쟁 — [상태 관리](/blog/orchestration/state-management/)",
		read_time: 12,
		desc: "RoundPrep 제5화. ‘동시에 하면 되지’가 통하지 않는 지점 — 의존성·한계·재시도.",
		takeaway1: "병렬은 ‘독립 태스크’에만 걸고, 실패·재시도 한도를 같이 적는다.",
	},
	"state-management.md": {
		thesis: "**상태 없는 오케스트레이션은 재시도할 때마다 처음부터 다시 도는 연극이다.**",
		stake: "야간 요약이 중간에 끊기면, 교수님 화면에는 **반쪽 요약**이 뜬다. 신뢰가 한 번에 깨진다.",
		turn: "체크포인트 없이 LLM만 다시 돌리자 **이전 단계에서 이미 읽은 Lab**을 또 읽어 API 비용만 두 배가 됐다.",
		payoff: "**혜준:** “중간 산출물은 **스키마**로 저장. 재시도는 실패한 노드부터.”",
		hook: "상태가 쌓이면 모델은 **다음에 무엇을 할지**를 말로 끌고 가야 한다 — [ReAct 패턴](/blog/orchestration/react-pattern/)",
		read_time: 13,
		desc: "RoundPrep 제6화. 멈췄다가 이어할 수 없으면 병원 아침에는 쓸 수 없다.",
		takeaway1: "재시도·중단을 전제로 중간 상태(스키마)를 설계한다.",
	},
	"react-pattern.md": {
		thesis: "**생각(추론)과 행동(툴)을 한 루프에 묶지 않으면, 툴은 엉뚱한 순서로 호출된다.**",
		stake: "메트포르민 예시처럼 **한 번의 잘못된 툴 순서**가 임상에서 무엇을 망가뜨리는지 팀은 이미 본다.",
		turn: "ReAct를 켰더니 루프가 돌고 비용만 샜다. **최대 스텝** 없이 운영에 넣지 않기로 한다.",
		payoff: "**서진:** “생각 텍스트는 **로그에 남길지** 정책부터 정합시다. 교수님 설명용이에요, 감사용이에요.”",
		hook: "루프가 여러 개면 **누가 지휘하는지**가 필요하다 — [슈퍼바이저 패턴](/blog/orchestration/supervisor-pattern/)",
		read_time: 14,
		desc: "RoundPrep 제7화. Thought–Action–Observation을 회진 파이프의 어느 칸에 넣을지 정한다.",
		takeaway1: "ReAct는 루프 설계(최대 스텝·종료·로그) 없이 켜면 비용·안전 둘 다 망가진다.",
	},
	"supervisor-pattern.md": {
		thesis: "**전문가를 여럿 두려면, 지휘자가 누구인지 한 명은 정해야 한다.**",
		stake: "‘에이전트 둘이 알아서 협력’은 회의를 끝내지 못한다. RoundPrep은 **아침 7시에 끝나야** 한다.",
		turn: "분산 채팅만 허용했더니 같은 Lab을 두 에이전트가 중복 조회했다. **중앙 슈퍼바이저** 안건이 올라온다.",
		payoff: "**박과장:** “감사 관점에선 **한 개의 orchestration trace**가 있어야 합니다.”",
		hook: "슈퍼바이저 아래 에이전트들이 **서로 뭐라고 보내는지** — [멀티 에이전트 통신](/blog/orchestration/multi-agent-communication/)",
		read_time: 12,
		desc: "RoundPrep 제8화. 여러 봇이 있을 때, 책임·호출 한 줄기를 잡는 패턴.",
		takeaway1: "멀티 에이전트는 ‘지휘자 1명 + 역할’이 없으면 운영에서 추적 불가다.",
	},
	"multi-agent-communication.md": {
		thesis: "**메시지가 어떤 버스를 타는지 정하지 않으면, 에이전트는 서로 떠들다가 컨텍스트만 태운다.**",
		stake: "토큰 비용과 지연이 동시에 늘면 박과장이 **“에이전트 줄여요”**라고 말한다.",
		turn: "블랙보드에 모두가 쓰게 두니 **누가 마지막에 덮었는지** 몰라 디버깅이 불가능해졌다.",
		payoff: "**혜준:** “RoundPrep은 **환자 단위 스레드** 하나, 그 안에만 메시지.”",
		hook: "메시지 내용 중 **사람 손을 타야 하는 줄** — [Human-in-the-Loop](/blog/orchestration/human-in-the-loop/)",
		read_time: 13,
		desc: "RoundPrep 제9화. A2A·공유 메모리·블랙보드를 회진 시나리오에 대입한다.",
		takeaway1: "통신 패턴은 ‘속도’보다 ‘추적 가능성’을 먼저 고른다.",
	},
	"human-in-the-loop.md": {
		thesis: "**HITL은 옵션이 아니라, 오더·책임이 걸린 경계에서의 전제다.**",
		stake: "Air Canada 판결은 회사 얘기지만, 병동에서는 **교수님 한 분의 신뢰**가 더 비싸다.",
		turn: "누군가 “승인은 나중에 붙이죠”라고 했다가 교수님이 **PoC 중단** 카드를 꺼낼 뻔한 가상 회의.",
		payoff: "**서진:** “제안과 실행 사이에 **항상** 교수님 화면을 둡니다.”",
		hook: "사람이 개입하는 지점에서 **근거 문서를 더 긁어와야** 한다 — [에이전틱 RAG](/blog/orchestration/agentic-rag/)",
		read_time: 13,
		desc: "RoundPrep 제10화. 챗봇 소송이 의료 팀 회의에서 어떻게 번역되는지.",
		takeaway1: "HITL은 UI가 아니라 책임·감사·오더 경계 설계다.",
	},
	"agentic-rag.md": {
		thesis: "**근거 없는 요약은 한 번이면 신뢰를 잃고, 에이전틱 RAG는 ‘부족하면 다시 찾는다’는 오케스트레이션이다.**",
		stake: "내부 가이드라인 PDF가 갱신됐는데 한 번만 검색하면 **옛 문서**를 인용한다. 교수님은 그걸 한 번으로 잡는다.",
		turn: "검색 루프를 무한히 열어두자 밤새 비용이 나갔다. **상한**이 없으면 안 된다.",
		payoff: "**혜준:** “검색은 **로그에 쿼리와 문서 ID**를 남깁니다.”",
		hook: "문서가 길어지면 창이 터진다 — [컨텍스트 윈도우 관리](/blog/orchestration/context-window-management/)",
		read_time: 13,
		desc: "RoundPrep 제11화. 가이드라인·야간 기록을 근거로 붙일 때의 검색 오케스트레이션.",
		takeaway1: "에이전틱 RAG는 ‘검색 반복’에 상한·중단 조건·출처 로그가 세트다.",
	},
	"context-window-management.md": {
		thesis: "**컨텍스트는 무한이 아니다. 자르면 잊는다는 전제로 설계해야 한다.**",
		stake: "열 명 환자 요약을 한 번에 넣으면 **앞쪽 환자 정보가 증발**한다. 회진 전 브리핑이 아니라 랜덤 브리핑이 된다.",
		turn: "요약→요약의 요약을 반복하다 **수치가 바뀐 채** 전달됐다는 가상 디버깅.",
		payoff: "**서진:** “환자별 **1페이지 캡**을 정책으로 박읍시다.”",
		hook: "흐름이 복잡해지면 if 지옥 대신 **그래프** 이야기가 나온다 — [LangGraph 입문](/blog/orchestration/langgraph-intro/)",
		read_time: 12,
		desc: "RoundPrep 제12화. 잘린 컨텍스트가 임상 브리핑에서 무엇을 의미하는지.",
		takeaway1: "윈도우 한계는 ‘요약 정책’과 ‘환자 단위 분리’로 먼저 막는다.",
	},
	"langgraph-intro.md": {
		thesis: "**그래프는 멋이 아니라, 무한 루프와 분기를 끊어내기 위한 구조다.**",
		stake: "에이전트 데모가 현장에서 **같은 툴을 열 번** 부르면, 그날로 신뢰는 끝이다.",
		turn: "AgentExecutor만 쓰다 로그에 **어느 분기**를 탔는지 안 남아 박과장이 감사 질문을 못 넘긴다.",
		payoff: "**혜준:** “RoundPrep v0.2는 **노드와 엣지가 있는 그림**부터 커밋합니다.”",
		hook: "그래프 안에서 에이전트가 **서로 말로 협상**하게 두려면 — [AutoGen 입문](/blog/orchestration/autogen-intro/)",
		read_time: 13,
		desc: "RoundPrep 제13화. 체크리스트와 코드 사이의 간격을 메우는 도구 이야기.",
		takeaway1: "LangGraph류 도구는 ‘시각화’가 아니라 루프·상태·재시작을 제품화한 층이다.",
	},
	"autogen-intro.md": {
		thesis: "**에이전트 대화는 유연하지만, 종료 조건과 사람 개입 없으면 영원히 떠든다.**",
		stake: "RoundPrep 회의에서 “멀티에이전트 멋지다”가 **일정**을 잡아먹는 걸 막아야 한다.",
		turn: "두 에이전트가 서로 동의만 하다 **실제 툴 호출은 안 함** — 가짜 진전.",
		payoff: "**박과장:** “대화 로그도 **감사 대상**입니다. 저장 정책부터.”",
		hook: "역할·크루 단위로 나누는 또 다른 접근 — [CrewAI 입문](/blog/orchestration/crewai-intro/)",
		read_time: 12,
		desc: "RoundPrep 제14화. 대화형 멀티에이전트를 PoC에 얹을지 말지.",
		takeaway1: "AutoGen류는 ‘대화’ 전에 종료·툴·HITL 훅을 스펙에 넣어야 한다.",
	},
	"crewai-intro.md": {
		thesis: "**역할(Role)을 코드로 박아 두면, 회의에서 “누가 뭐 하는지” 설명이 쉬워진다.**",
		stake: "교수님은 **책임 주체**를 한 명씩 듣고 싶어 한다. 익명의 ‘AI 팀’은 싫다.",
		turn: "역할만 예쁘게 써 놓고 **실제 데이터 권한**은 안 맞춰 전부 403.",
		payoff: "**서진:** “크루는 **임상 역할 이름**과 맞춥니다. 수집/요약/검토.”",
		hook: "이제 흩어진 그림을 **한 장**으로 접자 — [의료 오케스트레이션 케이스 스터디](/blog/orchestration/medical-orchestration-case-study/)",
		read_time: 12,
		desc: "RoundPrep 제15화. 역할 기반 멀티에이전트를 회진 파이프에 얹는 상상.",
		takeaway1: "역할은 마케팅 카피가 아니라 권한·로그·HITL과 1:1로 매핑해야 한다.",
	},
	"orchestration-testing.md": {
		thesis: "**비결정론적이라서 테스트를 안 하는 게 아니라, 다른 종류의 테스트를 해야 한다.**",
		stake: "박과장이 **증명**을 원한다. “가끔 잘되던데요”는 통과가 안 된다.",
		turn: "스테이징에서만 통과하고 **야간 Lab 지연**에서 터진 가상 릴리스.",
		payoff: "**혜준:** “골든 시나리오 + 회귀 + 메트릭 상한을 **CI에** 넣습니다.”",
		hook: "테스트가 실패했는데 **어디가 범인인지** — [오케스트레이션 디버깅](/blog/orchestration/orchestration-debugging/)",
		read_time: 14,
		desc: "RoundPrep 제17화. 다이어그램 다음은 증거다.",
		takeaway1: "LLM 파이프는 시나리오·회귀·eval 메트릭을 ‘제품’처럼 관리한다.",
	},
	"orchestration-debugging.md": {
		thesis: "**추적 ID 없는 오케스트레이션은, 응급실에서 원인 모르는 쇼크와 같다.**",
		stake: "장애 나서 **재현이 안 되면** 박과장은 롤백을 외친다. 서진은 환자 브리핑을 못 받는다.",
		turn: "로그에 프롬프트만 있고 **노드 ID**가 없어 하루를 태웠다.",
		payoff: "**혜준:** “trace_id는 **환자·배치·요청** 삼각으로 겹칩니다.”",
		hook: "디버깅은 일회성이 아니라 **상시 관찰**로 이어져야 한다 — [오케스트레이션 모니터링](/blog/orchestration/orchestration-monitoring/)",
		read_time: 13,
		desc: "RoundPrep 제18화. 누가 누구를 불렀는지 없으면 멈춘다.",
		takeaway1: "노드·툴·모델 버전·trace_id 없이 운영하지 않는다.",
	},
	"orchestration-monitoring.md": {
		thesis: "**프로덕션 AI는 배포가 끝이 아니라, 관찰 가능성의 시작이다.**",
		stake: "아침마다 돌아가는 배치가 **조용히 느려지면** 아무도 모른다가, 어느 날 한꺼번에 터진다.",
		turn: "알람이 너무 많아 **알림 피로** — 진짜 위험을 놓친다.",
		payoff: "**서진:** “SLO는 **지연·실패율·HITL 대기시간** 세 개부터.”",
		hook: "관찰만으로는 **공격면**이 안 보인다 — [오케스트레이션 보안](/blog/orchestration/orchestration-security/)",
		read_time: 13,
		desc: "RoundPrep 제19화. 운영자 눈에 보이게 만드는 것.",
		takeaway1: "대시보드는 그래프가 아니라 SLO·알람·온콜 액션과 세트다.",
	},
	"orchestration-security.md": {
		thesis: "**에이전트가 늘면 공격 표면도 늘고, 프롬프트 인젝션은 ‘문장 하나’로 들어온다.**",
		stake: "환자 자유기술에 **“이전 지시 무시”** 류 문장이 섞이면, 한 노드가 전체를 망가뜨릴 수 있다.",
		turn: "샌드박스에서 **툴 과호출**로 외부 API 비용이 터진 가상 사고.",
		payoff: "**박과장:** “툴은 **화이트리스트**, 입력은 **스키마**.”",
		hook: "보안과 비용은 같이 온다 — [오케스트레이션 비용 최적화](/blog/orchestration/orchestration-cost-optimization/)",
		read_time: 13,
		desc: "RoundPrep 제20화. 멀티스텝이 열리면 닫혀야 할 문도 늘어난다.",
		takeaway1: "에이전트 보안은 툴 권한·입력 검증·감사 로그가 한 묶음이다.",
	},
	"orchestration-cost-optimization.md": {
		thesis: "**비용은 토큰이 아니라 ‘몇 번 실패하고 몇 번 재시도했는지’로 폭발한다.**",
		stake: "PoC 예산은 얇다. 한 달 안에 **단가 설명**을 못 하면 다음 분기는 없다.",
		turn: "병렬+ReAct+긴 컨텍스트를 동시에 켜 **하루 천만 토큰** 가상 청구.",
		payoff: "**혜준:** “비용 대시보드는 **노드별**로 쪼갭니다.”",
		hook: "시리즈 1막은 끝났다. 빈칸은 **앞 장으로 돌아가서** 채우면 된다 — [오케스트레이션이란 무엇인가](/blog/orchestration/what-is-orchestration/)",
		read_time: 13,
		desc: "RoundPrep 제21화. 멀티스텝의 숨은 청구서.",
		takeaway1: "비용 최적화는 모델 교체보다 먼저 루프·캐시·병렬·프롬프트 길이를 본다.",
	},
};

function inject(name, raw) {
	const bodyStart = raw.indexOf("\n---", raw.indexOf("---") + 1);
	const body = bodyStart === -1 ? raw : raw.slice(bodyStart);
	if (body.includes("\n### 테제\n")) return null;
	const cfg = P[name];
	if (!cfg) return null;

	let s = raw;

	// description + read_time in frontmatter
	if (cfg.desc) {
		s = s.replace(/^description:\s*"[^"]*"/m, `description: "${cfg.desc}"`);
	}
	if (cfg.read_time) {
		s = s.replace(/^read_time:\s*\d+/m, `read_time: ${cfg.read_time}`);
	}

	// key_takeaways 는 수동 검수 권장(태그 YAML 오인식 방지). description/read_time 만 자동.

	const block = `
### 테제

${cfg.thesis}

### 스테이크

${cfg.stake}

### 전환점 — RoundPrep 메모

${cfg.turn}

`;

	// Insert immediately before first top-level ## 본문 (not inside code fences — 희귀)
	const splitRe = /\r?\n## 본문\r?\n/;
	if (!splitRe.test(s)) return null;
	const idx = s.search(splitRe);
	const head = s.slice(0, idx);
	const rest = s.slice(idx);
	if (!head.includes("## 한줄 요약")) return null;
	s = `${head}${block}${rest}`;

	const pay = `

### 다음 회의 한 줄

${cfg.payoff}

### 다음 화

${cfg.hook}
`;

	// Before 편집 초안 footer: remove short ### 이야기 속에서 if present and replace
	if (/### 이야기 속에서 이어서\r?\n\r?\n[^\n]+\r?\n\r?\n\*편집 초안/m.test(s)) {
		s = s.replace(/\r?\n### 이야기 속에서 이어서\r?\n\r?\n[^\n]+\r?\n\r?\n(\*편집 초안)/, `${pay}\n\n$1`);
	} else if (/\*편집 초안/.test(s)) {
		s = s.replace(/\r?\n(\*편집 초안)/, `${pay}\n\n$1`);
	}

	return s;
}

let n = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md"))) {
	if (!P[f]) continue;
	const fp = path.join(dir, f);
	const raw = fs.readFileSync(fp, "utf8");
	const next = inject(f, raw);
	if (next && next !== raw) {
		fs.writeFileSync(fp, next, "utf8");
		console.log("injected", f);
		n++;
	}
}
console.log("done", n);
