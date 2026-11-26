import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const ko=JSON.parse(read('src/data/technology-registry.json')),en=JSON.parse(read('src/data/technology-en.json'));
assert.equal(en.entries.length,288);assert.deepEqual(en.entries.map(x=>x.id),ko.entries.map(x=>x.id));assert.deepEqual(en.groups.map(x=>x.id),ko.groups.map(x=>x.id));for(const e of en.entries)assert.ok(e.definition&&!/[가-힣]/.test(e.definition),e.id);
const html=path=>read('dist/'+path+'/index.html');
for(const path of ['technology','en/technology']){const h=html(path);assert.equal((h.match(/hreflang=/g)||[]).length,3,path);assert.ok(h.includes('https://sreborn.net/en/technology/'));assert.ok(h.includes('https://sreborn.net/technology/'));assert.ok(h.includes('rel="canonical" href="https://sreborn.net/'+path+'/"'),path);}
const h=html('en/technology');assert.ok(h.includes('lang="en"'));assert.equal((h.match(/data-kp-entry(?:\s|>)/g)||[]).length,288);
for(const path of ['blog/aerini/what-is-ai','en/blog/aerini/what-is-ai','blog','en/blog'])assert.equal((html(path).match(/hreflang=/g)||[]).length,0,path);
assert.ok(html('en/blog/aerini/what-is-ai').includes('content="noindex"'));assert.ok(html('en/blog/aerini/what-is-ai').includes('data-untranslated-notice'));assert.ok(read('dist/sitemap-0.xml').includes('https://sreborn.net/en/technology/'));
console.log('B3 English registry and SEO contract PASS: 288 concepts');
