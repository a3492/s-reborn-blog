// Strict public manifest. Private data does not belong in this repository.
export const KIND_LABELS={news:'뉴스','research-protocol':'연구 계획','research-result':'연구 결과',education:'교육'};
export function validatePublications(m,registry){
 const fail=x=>{throw Error('Publication gate: '+x)};
 const keys=(o,a)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>a.includes(k));
 const text=x=>typeof x==='string'&&x.trim().length>0;
 const day=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
 const url=x=>typeof x==='string'&&/^https:\/\/(?:www\.anthropic\.com|arxiv\.org|agentskills\.io|code\.claude\.com)\/[A-Za-z0-9._~/-]+$/.test(x);
 const inspect=x=>{if(typeof x==='string'){
  if(/(?:notion\.(?:so|site|com)|docs\.google\.com|drive\.google\.com|file:\/\/|[A-Za-z]:\\|(?:^|[^a-f0-9])[a-f0-9]{32}(?:$|[^a-f0-9]))/i.test(x))fail('private locator');
  for(const u of x.match(/https?:\/\/[^\s<>"]+/g)??[])if(!url(u))fail('unapproved URL');
 }else if(Array.isArray(x))x.forEach(inspect);else if(x&&typeof x==='object')Object.values(x).forEach(inspect);};
 if(!keys(m,['version','records'])||m.version!=='1.0'||!Array.isArray(m.records))fail('manifest');
 inspect(m);
 const ids=new Set(m.records.map(r=>r.id)),tech=new Set(registry.entries.map(r=>r.id));
 if(ids.size!==m.records.length)fail('duplicate');
 const common=['id','kind','title','summary','details','technologyIds','relatedIds','sources','version','language','publishedAt','review','access','status'];
 const extras={news:['eventDate','eventStatus'],'research-protocol':['researchStatus','plannedResponses'],'research-result':['researchStatus','result','method','limitations','evidenceUrls'],education:['guideHref','level']};
 for(const r of m.records){
  const bad=x=>fail(r.id+': '+x);
  if(!Object.hasOwn(KIND_LABELS,r.kind)||!keys(r,[...common,...extras[r.kind]])||!/^PUB-[NRE]\d{3,}$/.test(r.id)||!text(r.title)||!text(r.summary)||!Array.isArray(r.details)||!r.details.length||!r.details.every(text))bad('fields');
  if(!keys(r.review,['status','basis','medical','privacy','verification','independent'])||r.status!=='published'||r.access!=='public'||r.review.status!=='approved'||r.review.medical!==false||r.review.privacy!=='safe'||r.review.verification!=='source-checked'||!text(r.review.basis))bad('review/access');
  if(r.language!=='ko'||!text(r.version)||!day(r.publishedAt))bad('metadata');
  if(!Array.isArray(r.technologyIds)||!r.technologyIds.length||r.technologyIds.some(x=>!tech.has(x)))bad('technology IDs');
  if(!Array.isArray(r.relatedIds)||!r.relatedIds.length||r.relatedIds.some(x=>!ids.has(x)||x===r.id))bad('related IDs');
  if(!Array.isArray(r.sources)||!r.sources.length||r.sources.some(s=>!keys(s,['title','url','publishedAt','checkedAt','claim'])||!text(s.title)||!text(s.claim)||!url(s.url)||!day(s.publishedAt)||!day(s.checkedAt)||s.publishedAt>s.checkedAt||s.checkedAt>r.publishedAt))bad('source');
  if(r.kind==='news'&&(!day(r.eventDate)||r.eventDate>r.publishedAt||!['announcement','release','availability'].includes(r.eventStatus)))bad('news');
  if(r.kind==='research-protocol'&&(r.researchStatus!=='protocol-only'||!Number.isInteger(r.plannedResponses)||r.plannedResponses<1))bad('protocol');
  if(r.kind==='research-result'&&(r.researchStatus!=='completed'||!text(r.result)||!text(r.method)||!text(r.limitations)||!Array.isArray(r.evidenceUrls)||!r.evidenceUrls.length||r.evidenceUrls.some(u=>!url(u))||r.review.independent!==true))bad('research evidence');
  if(r.kind==='education'&&(!/^\/technology\/[a-z0-9-]+\/$/.test(r.guideHref)||!['beginner','intermediate','advanced'].includes(r.level)))bad('education');
 }
 return m.records;
}