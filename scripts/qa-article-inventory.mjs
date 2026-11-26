import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {load} from 'js-yaml';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const root='src/content/blog', dist=path.resolve('dist'), origin='https://sreborn.net';
const files=readdirSync(root,{recursive:true,withFileTypes:true}).filter(f=>f.isFile()&&/\.(md|mdx)$/.test(f.name)).map(f=>path.join(f.parentPath,f.name)).sort();
const rows=[],titles=new Map(),bodies=new Map(),external=new Map(),anchors=new Map(),errors=[];
const add=(m,k,id)=>{if(!m.has(k))m.set(k,[]);m.get(k).push(id)};
const normal=s=>String(s??'').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
const rules=[
 ['guarantee',/효과\s*(?:를\s*)?보장|완치\s*(?:를\s*)?보장|부작용\s*(?:이\s*)?없(?:다|는|습니다)|100\s*%\s*(?:안전|효과|완치)|무조건\s*(?:개선|치료|효과)/iu],
 ['superlative',/(?:국내|세계|전국)\s*(?:최고|최초|유일)|최고의\s*(?:병원|시술|치료)|타\s*병원보다/iu],
 ['testimonial',/환자\s*(?:후기|체험담)|치료\s*(?:후기|체험담)|시술\s*(?:후기|체험담)|전후\s*사진/iu],
 ['promotion',/(?:시술|치료|진료)\s*(?:비용|가격|할인|이벤트)|(?:무료|할인)\s*(?:시술|진료|치료)/iu],
 ['clinical-claim',/(?:진단|치료|검출)\s*(?:정확도|성공률|효과)\s*(?:가|는|은|이|:)?\s*\d+(?:\.\d+)?\s*%/iu]
];
const medicalHint=/환자|의료|진료|시술|치료|진단|의약품|병원|임상|부작용|피부|medical|clinical|patient|diagnos|treatment/i;
const redirect=readFileSync('public/_redirects','utf8').split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#')).map(l=>l.split(/\s+/));
const escapeRe=s=>s.replace(/[.*+?^$()|[\]\\]/g,'\\$&');
const resolveRedirect=u=>{for(const [from,to,code] of redirect){if(!/^30[1278]!?$/.test(code??''))continue;const vars=[];const pattern=from.split(/(:[a-zA-Z][\w-]*|\*)/).map(x=>{if(x==='*'){vars.push('splat');return '(.*)'}if(x.startsWith(':')){vars.push(x.slice(1));return '([^/]+)'}return escapeRe(x)}).join('');const m=u.pathname.match(new RegExp('^'+pattern+'$'));if(m){let target=to;vars.forEach((v,i)=>target=target.replace(':'+v,m[i+1]));return new URL(target,u)}}return null};
const localFile=u=>{try{let p=path.resolve(dist,'.'+decodeURIComponent(u.pathname));if(p!==dist&&!p.startsWith(dist+path.sep))return null;for(const f of [p,path.join(p,'index.html'),p+'.html'])if(existsSync(f)&&statSync(f).isFile())return f}catch{}return null};
const isLocal=u=>u.hostname==='sreborn.net'||u.hostname==='www.sreborn.net';
function localResolve(u){let current=u;const seen=new Set();for(let i=0;i<8;i++){if(!isLocal(current))return {external:current};if(seen.has(current.href))return {reason:'redirect-loop'};seen.add(current.href);const red=resolveRedirect(current);if(red){current=red;continue}const file=localFile(current);if(file)return {file,hash:current.hash};return {reason:'missing-local-target'}}return {reason:'redirect-depth'}}
// Public link probe: unauthenticated GET only. No API, private host, credential URL,
// query with access token, or local/IP literal target. No private URL is emitted.
function publicUrl(u){return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password&&(!u.port||['80','443'].includes(u.port))&&!isIP(u.hostname)&&u.hostname.includes('.')&&!/(?:^|\.)(?:localhost|local|internal|test|invalid|notion\.so|notion\.site|notion\.com|docs\.google\.com|drive\.google\.com|api\.cloudflare\.com)$/i.test(u.hostname)&&!/(?:token|secret|password|credential|signature|auth|api[_-]?key|session|code)=/i.test(u.search)&&!/^\/(?:api|admin|auth|logout|delete|unsubscribe)(?:\/|$)/i.test(u.pathname)}
function publicAddress(ip){if(ip.includes(':'))return !/^(?:fc|fd|fe[89ab]|::|2001:db8)/i.test(ip)&&!ip.toLowerCase().includes('::ffff:');return !/^(?:0\.|10\.|127\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|192\.0\.|198\.(?:18|19)\.|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|2[2-5]\d\.)/.test(ip)}
async function probe(url){let u=new URL(url);for(let i=0;i<5;i++){if(!publicUrl(u))return 'skipped-private-or-api';try{const ips=await Promise.race([lookup(u.hostname,{all:true}),new Promise((_,rej)=>setTimeout(()=>rej(Error('dns timeout')),4000).unref())]);if(!ips.length||ips.some(x=>!publicAddress(x.address)))return 'skipped-private-address';const r=await fetch(u,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(7000),headers:{'User-Agent':'S-Reborn public link audit','Range':'bytes=0-0'}});const status=r.status;const loc=r.headers.get('location');await r.body?.cancel();if(status>=300&&status<400&&loc){u=new URL(loc,u);continue}return status===404||status===410?'broken-'+status:status>=200&&status<300?'ok': 'unconfirmed-'+status}catch(e){return 'unconfirmed-network'}}return 'unconfirmed-redirect-depth'}
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 const parse=async html=>page.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');const q=(s,a)=>[...d.querySelectorAll(s)].map(e=>a?e.getAttribute(a):e.textContent);const body=d.querySelector('.blog-post-prose');return {canon:q('link[rel=canonical]','href'),title:q('title'),desc:q('meta[name=description]','content'),robots:q('meta[name=robots]','content'),og:q('meta[property="og:url"]','content'),json:q('#article-json-ld'),h1:q('main h1'),links:body?[...body.querySelectorAll('a[href],img[src],source[src]')].map(e=>e.getAttribute(e.tagName==='A'?'href':'src')):[],ids:q('[id]','id'),body:!!body}},html);
 async function idsFor(file){if(!anchors.has(file))anchors.set(file,new Set((await parse(readFileSync(file,'utf8'))).ids));return anchors.get(file)}
 for(const file of files){
  const id=path.relative(root,file).split(path.sep).join('/').replace(/\.(md|mdx)$/,'');const source=readFileSync(file,'utf8');const fm=source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);assert.ok(fm,'frontmatter '+id);const data=load(fm[1]);const body=source.slice(fm[0].length);const risk=rules.filter(([,r])=>r.test(body)).map(([k])=>k);const medical=medicalHint.test(id+' '+data.title+' '+data.description+' '+body);const row={id,draft:!!data.draft,medical,risk,issues:[],localFailures:[],externalCount:0};rows.push(row);
  if(!normal(data.title)||!normal(data.description)||!data.date)row.issues.push('missing-source-metadata');
  if(data.needsExpansion||/참고문헌 정리 중|주의사항 1|구체적인 사용 사례를 통해 어떻게 활용할 수 있는지/.test(body))row.issues.push('placeholder-or-expansion');
  add(titles,normal(data.title),id);const norm=normal(body);if(norm)add(bodies,createHash('sha256').update(norm).digest('hex'),id);
  if(data.draft)continue;
  const expected=origin+'/blog/'+id+'/';const fileHtml=localFile(new URL(expected));if(!fileHtml){row.issues.push('missing-rendered-article');continue}
  const v=await parse(readFileSync(fileHtml,'utf8'));anchors.set(fileHtml,new Set(v.ids));
  if(v.canon.length!==1||v.canon[0]!==expected)row.issues.push('canonical');
  if(v.title.length!==1||!normal(v.title[0])||v.desc.length!==1||!normal(v.desc[0])||v.h1.length!==1||!v.body)row.issues.push('rendered-metadata');
  if(v.og.length!==1||v.og[0]!==expected)row.issues.push('og-url');
  try{const j=JSON.parse(v.json[0]);if(v.json.length!==1||j['@type']!=='BlogPosting'||j.url!==expected||j.mainEntityOfPage?.['@id']!==expected||!j.headline||!j.description||!j.datePublished||Number.isNaN(Date.parse(j.datePublished)))row.issues.push('article-jsonld')}catch{row.issues.push('article-jsonld')}
  if(v.robots.some(x=>x?.includes('noindex')))row.issues.push('noindex-review');
  for(const link of new Set(v.links.filter(Boolean))){if(/^(?:mailto:|tel:|data:|blob:|javascript:)/i.test(link))continue;let u;try{u=new URL(link,expected)}catch{row.issues.push('invalid-url');continue}
   let resolved=isLocal(u)?localResolve(u):{external:u};if(resolved.file){if(resolved.hash&&/\.html$/.test(resolved.file)){let fragment;try{fragment=decodeURIComponent(resolved.hash.slice(1))}catch{fragment=resolved.hash.slice(1)}if(fragment&&!fragment.startsWith(':~:')&&!(await idsFor(resolved.file)).has(fragment))row.localFailures.push({path:u.pathname,kind:'missing-fragment'})}continue}
   if(resolved.reason){row.localFailures.push({path:u.pathname,kind:resolved.reason});continue}
   if(resolved.external){if(!publicUrl(resolved.external)){row.issues.push('external-link-not-probed');continue}resolved.external.hash='';add(external,resolved.external.href,id);row.externalCount++}
  }
 }
 await page.close();
}finally{await browser.close()}
assert.equal(rows.length,421,'baseline inventory');
const groups=m=>[...m.values()].filter(a=>a.length>1);
const duplicates={title:groups(titles),body:groups(bodies)};
const urls=[...external.keys()], results=[];let next=0;
await Promise.all(Array.from({length:12},async()=>{while(next<urls.length){const url=urls[next++];const status=await probe(url);results.push({status,ids:[...new Set(external.get(url))],host:new URL(url).hostname})}}));
const counts={};for(const x of results)counts[x.status]=(counts[x.status]??0)+1;
const summary={inventory:rows.length,published:rows.filter(x=>!x.draft).length,medicalCandidates:rows.filter(x=>x.medical).length,adRiskCandidates:rows.filter(x=>x.risk.length).length,metadataCandidates:rows.filter(x=>x.issues.length).length,localFailureArticles:rows.filter(x=>x.localFailures.length).length,duplicateTitleGroups:duplicates.title.length,duplicateBodyGroups:duplicates.body.length,externalUnique:urls.length,externalStatuses:counts};
console.log('ARTICLE_AUDIT_SUMMARY '+JSON.stringify(summary));
for(const r of rows.filter(x=>x.risk.length||x.medical||x.issues.length||x.localFailures.length))console.log('ARTICLE_AUDIT_ROW '+JSON.stringify({id:r.id,draft:r.draft,medical:r.medical,risk:r.risk,issues:[...new Set(r.issues)],localFailureCount:r.localFailures.length}));
for(const r of rows.filter(x=>x.localFailures.length))console.log('ARTICLE_LOCAL_LINKS '+JSON.stringify({id:r.id,links:r.localFailures}));
for(const [kind,lists] of Object.entries(duplicates))for(const ids of lists)console.log('ARTICLE_DUPLICATE '+JSON.stringify({kind,ids}));
for(const r of results.filter(x=>x.status!=='ok'))console.log('ARTICLE_EXTERNAL '+JSON.stringify(r));
// Findings are legacy review candidates; no claim of factual/legal verification.
// Structural invariant introduced in this PR is mandatory on every built public article.
assert.ok(!rows.some(x=>!x.draft&&x.issues.includes('article-jsonld')),'new structured-data contract');
