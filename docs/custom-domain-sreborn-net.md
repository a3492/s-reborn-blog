# sreborn.net → Cloudflare Pages

상태: **미적용**. 이 클라우드 에이전트 VM에는 Cloudflare 인증이 없다.

- `npx wrangler whoami` → `You are not authenticated`
- 환경 변수 `CLOUDFLARE_API_TOKEN`, `CF_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` 없음
- Wrangler 4.147의 `wrangler pages`에는 custom domain 하위 명령이 없다. Pages 커스텀 도메인은 대시보드 또는 API로만 붙인다.
- 시크릿을 저장소나 이 문서에 넣지 않는다.

가정:

- Pages 프로젝트 이름은 `s-reborn-blog`이고, 기본 호스트는 `https://s-reborn-blog.pages.dev`이다.
- `sreborn.net`은 Cloudflare Registrar에서 Active이며, 존이 Pages 프로젝트와 **같은 Cloudflare 계정**에 있다. Apex 도메인은 그 계정의 존이어야 한다.
- 공개 캐노니컬 오리진은 apex `https://sreborn.net`이다. `www.sreborn.net`은 같은 사이트로 붙인 뒤 apex로 리다이렉트한다.
- 저장소의 `package.json` name, GitHub 저장소, URL 경로 `/s-reborn-blog/`는 배포 식별자라 바꾸지 않았다.
- `wrangler.toml`은 추가하지 않았다. 이 사이트는 Git 연동 Pages이고, Workers의 `routes.custom_domain` 설정은 Pages 커스텀 도메인을 만들지 않는다.
- `astro.config.mjs`의 `site`는 `https://sreborn.net`이다. 사이트맵·canonical은 도메인이 Active가 된 다음 배포부터 그 호스트를 가리킨다.

## 1. 존 확인

1. Cloudflare 대시보드 → 도메인 `sreborn.net`.
2. 네임서버가 Cloudflare 네임서버인지 확인한다. Registrar에서 산 도메인이라도 존이 다른 계정에 있으면 Pages가 apex CNAME을 만들 수 없다.
3. DNS에 apex(`@`) A, AAAA, CNAME이 이미 있으면 적어 둔다. Pages가 제안하는 레코드와 충돌하면 기존 apex 레코드를 지운 뒤에 진행한다.

## 2. Pages에 도메인 연결

1. [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) → 프로젝트 **s-reborn-blog**.
2. **Custom domains** → **Set up a domain**.
3. `sreborn.net` 입력 → **Continue**.
4. 같은 계정 존이면 Cloudflare가 DNS 레코드를 제안한다. 확인 후에만 활성화한다.
5. 상태가 **Active**이고 인증서가 발급될 때까지 기다린다. 보통 몇 분이다.
6. 같은 방식으로 `www.sreborn.net`을 두 번째 커스텀 도메인으로 추가한다.

대시보드보다 API를 쓸 때 (토큰은 로컬에만 둔다):

```sh
# Pages:Edit 권한이 있는 API 토큰
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/s-reborn-blog/domains" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"name":"sreborn.net"}'

curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/s-reborn-blog/domains" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"name":"www.sreborn.net"}'
```

## 3. DNS 레코드

Pages에 도메인을 **먼저** 등록한 뒤, 존이 같은 계정이면 아래 CNAME이 자동으로 생긴다. 등록 전에 CNAME만 만들면 `522`가 난다.

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | `@` (`sreborn.net`) | `s-reborn-blog.pages.dev` | Proxied (주황 구름) |
| CNAME | `www` | `s-reborn-blog.pages.dev` | Proxied (주황 구름) |

Apex CNAME은 Cloudflare DNS의 CNAME flattening으로 동작한다. Pages용 A/AAAA를 임의 IP로 추가하지 않는다.

`www`를 별도 사이트로 두지 않으려면, `www` 커스텀 도메인 대신 Redirect Rule을 쓴다.

- Match: Hostname equals `www.sreborn.net`
- Then: Dynamic redirect to `https://sreborn.net/${path}` (status 301, preserve query)

## 4. 확인

```sh
dig +short sreborn.net CNAME
dig +short www.sreborn.net CNAME
curl -sI https://sreborn.net | head
curl -sI https://www.sreborn.net | head
curl -sI https://s-reborn-blog.pages.dev | head
```

기대값: `https://sreborn.net`은 200(또는 사이트의 정상 응답)이고 인증서 이름이 `sreborn.net`이다. `www`는 301로 apex에 닿거나, 커스텀 도메인으로 붙였다면 같은 사이트를 연다. `*.pages.dev`는 그대로 동작한다.

CAA 레코드가 있다면 `letsencrypt.org`, `pki.goog`, `ssl.com` 발급을 허용해야 한다. 그렇지 않으면 커스텀 도메인 인증서가 안 나온다. [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)

## 5. 배포 후 같이 바꿀 설정

코드 기본 제목은 `S-reborn MD AI HUB`이다. 아래는 저장소 밖에 있다.

1. **Supabase `site_settings`**: `site_meta.title`이 예전의 `S-Reborn AI Blog`이면 런타임 Topbar·SEO가 그 값을 쓴다. 어드민 → Settings에서 제목을 `S-reborn MD AI HUB`로 저장하거나, 해당 키를 비워 코드 기본값을 쓰게 한다.
2. **Supabase Auth**: Site URL과 Redirect URLs에 `https://sreborn.net/**`를 넣는다. `https://s-reborn-blog.pages.dev/**`는 pages.dev를 계속 쓸 동안 남겨 둔다.
3. 선택: `s-reborn-blog.pages.dev` → `https://sreborn.net` Bulk Redirect. 미리보기 호스트(`*.s-reborn-blog.pages.dev`)까지 막지 않는다.
