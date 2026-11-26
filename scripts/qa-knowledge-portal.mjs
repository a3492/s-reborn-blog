import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>readFileSync(p,'utf8');
const registry=JSON.parse(read('src/data/technology-registry.json'));
const rules=JSON.parse(read('src/data/technology-links.json'));
const ids=new Set(registry.entries.map(x=>x.id));
assert.equal(ids.size,288);assert.equal(registry.entries.length,288);assert.equal(registry.groups.length,5);
assert.equal(registry.entries.filter(x=>!x.parent).length,192);
assert.equal(registry.entries.filter(x=>x.parent).length,96);
for(const item of registry.entries){assert.ok(item.name&&item.definition);if(item.parent)assert.ok(ids.has(item.parent));}
const csv=read('docs/plans/taxonomy-v2-mapping.csv').trimEnd().split(/\r?\n/).slice(1);
assert.equal(csv.length,421);
for(const [slug,keys] of Object.entries(rules)){assert.ok(csv.some(row=>row.split(',')[0].replace(/\.mdx?$/,'').split('/').pop()===slug),slug);for(const id of keys)assert.ok(ids.has(id),id);}
for(const file of ['index.astro','skills-guide.astro','prompt-examples.astro'])assert.ok(read('src/pages/technology/'+file).includes('Layout'));
console.log(JSON.stringify({registry:ids.size,root:192,detail:96,legacyMapping:csv.length,slugRules:Object.keys(rules).length,status:'pass'}));