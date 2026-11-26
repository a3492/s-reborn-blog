import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {validatePublications} from '../src/data/publication-policy.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const manifest=read('src/data/publications.json'),registry=read('src/data/technology-registry.json');
const records=validatePublications(manifest,registry);
assert.equal(records.filter(r=>r.kind==='news').length,2);assert.equal(records.filter(r=>r.kind==='research-protocol').length,1);assert.equal(records.filter(r=>r.kind==='education').length,2);
for(const r of records.filter(r=>r.kind==='education'))assert.ok(existsSync('src/pages'+r.guideHref.replace(/\/$/,'')+'.astro'));
const negative=[
 r=>r.status='draft',r=>r.access='private',r=>r.review.status='pending',r=>r.review.medical=true,r=>r.review.privacy='unchecked',r=>r.review.verification='unverified',
 r=>r.sources=[],r=>r.sources[0].url='http://example.invalid',r=>r.sources[0].checkedAt='2026-02-30',r=>r.technologyIds=['MISSING'],r=>r.relatedIds=['MISSING'],
 r=>r.eventStatus='unknown',r=>r.eventDate='2027-01-01',r=>r.extra='unexpected payload',r=>r.review.internal='unexpected payload',
 r=>r.summary='https://'+['notion','so'].join('.')+'/example',r=>r.sources[0].url='https://example.invalid/private',
 r=>r.details.push('a'.repeat(32)),r=>{r.kind='research-result';r.researchStatus='completed';r.result='fabricated';}
];
for(const mutate of negative){const x=structuredClone(manifest);mutate(x.records[0]);assert.throws(()=>validatePublications(x,registry));}
const x=structuredClone(manifest);x.records[2].result='fabricated';assert.throws(()=>validatePublications(x,registry));
const dup=structuredClone(manifest);dup.records.push(dup.records[0]);assert.throws(()=>validatePublications(dup,registry));
console.log(JSON.stringify({ok:true,publicRecords:records.length,negativeCases:negative.length+2}));