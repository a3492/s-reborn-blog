export type HandOffRecord = {
  title: string;
  date: string;
  owner: string;
  done: string;
  next: string;
  risks: string;
  link: string;
};

export const recentHandOffs: HandOffRecord[] = [
  {
    title: 'Docs / worktree ops',
    date: '2026-03-26',
    owner: 'Codex',
    done: 'docs 홈에 Quick Start, 종료 절차, hand-off/rebase 요약을 추가했다.',
    next: '작업별 worktree를 실제로 분리할 때만 새 브랜치를 만든다.',
    risks: '원격 main drift가 생기면 rebase 전에 기준 worktree를 고정해야 한다.',
    link: '/docs/context-worktree-ops',
  },
  {
    title: 'Admin / publish flow',
    date: '2026-03-25',
    owner: 'Codex',
    done: 'publish job 상세, retry, preview, pipeline health까지 운영 흐름을 묶었다.',
    next: '실배포 webhook과 에러 재시도 정책을 더 단단히 만든다.',
    risks: 'GitHub / Supabase / Cloudflare env가 불일치하면 publish health check가 실패한다.',
    link: '/admin/jobs',
  },
];
