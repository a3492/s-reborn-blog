import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(p,'utf8');
const ko=JSON.parse(read('src/data/technology-registry.json')),en=JSON.parse(read('src/data/technology-en.json'));
assert.equal(en.entries.length,288);assert.deepEqual(en.entries.map(x=>x.id),ko.entries.map(x=>x.id));assert.deepEqual(en.groups.map(x=>x.id),ko.groups.map(x=>x.id));for(const e of en.entries)assert.ok(e.definition&&!/[가-힣]/.test(e.definition),e.id);
const html=path=>read('dist/'+path+'/index.html');
for(const path of ['technology','en/technology']){const h=html(path);assert.equal((h.match(/hreflang=/g)||[]).length,3,path);assert.ok(h.includes('https://sreborn.net/en/technology/'));assert.ok(h.includes('https://sreborn.net/technology/'));assert.ok(h.includes('rel="canonical" href="https://sreborn.net/'+path+'/"'),path);}
const h=html('en/technology');assert.ok(h.includes('lang="en"'));assert.equal((h.match(/data-kp-entry(?:\s|>)/g)||[]).length,288);
for(const path of ['blog/aerini/what-is-llm','en/blog/aerini/what-is-llm','blog','en/blog'])assert.equal((html(path).match(/hreflang=/g)||[]).length,0,path);
assert.ok(html('en/blog/aerini/what-is-llm').includes('content="noindex"'));assert.ok(html('en/blog/aerini/what-is-llm').includes('data-untranslated-notice'));assert.ok(read('dist/sitemap-0.xml').includes('https://sreborn.net/en/technology/'));
console.log('B3 English registry and SEO contract PASS: 288 concepts');

const depth=JSON.parse(read('src/data/technology-depth-en.json'));
assert.deepEqual(depth.map(d=>d.id),['ENG-002','ENG-009','CMP-009','CMP-017','REP-001','REP-002']);
assert.equal((h.match(/data-depth-en=/g)||[]).length,6);
const manifest=JSON.parse(read('src/data/blog-translations-en.json'));
assert.equal(Object.keys(manifest).length,5);
const sitemap=read('dist/sitemap-0.xml');
for(const [id,m] of Object.entries(manifest)){
 const source=read('src/content/blog/'+id+'.md');
 assert.equal(createHash('sha1').update('blob '+Buffer.byteLength(source)+String.fromCharCode(0)+source).digest('hex'),m.sourceSha,id+' source revision');
 const body=read('src/translations/en/'+id+'.md');assert.ok(body.length>1000&&!/[가-힣]/.test(body),id+' English body');
 for(const path of ['blog/'+id,'en/blog/'+id]){
 const x=html(path);assert.equal((x.match(/hreflang=/g)||[]).length,3,path);assert.ok(x.includes('rel="canonical" href="https://sreborn.net/'+path+'/"'));assert.ok(!x.includes('content="noindex"'),path);assert.ok(sitemap.includes('https://sreborn.net/'+path+'/'),path);
 }
 const x=html('en/blog/'+id);assert.ok(x.includes('lang="en"')&&!x.includes('data-untranslated-notice'));assert.ok(x.includes(m.title.replaceAll('&','&amp;')),id);
}
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):e.name==='index.html'?[dir+'/index.html']:[]);
for(const file of walk('dist/en/blog')){const id=file.slice('dist/en/blog/'.length,-'/index.html'.length);if(Object.hasOwn(manifest,id))continue;const x=read(file);assert.ok(x.includes('content="noindex"'),file);assert.ok(!x.includes('hreflang='),file);}
console.log('B3 batch 02: six depth translations, five article translations, untranslated routes protected');
