import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),page=fs.readFileSync(path.join(root,'public/tutorials/crm-scenarios/index.html'),'utf8');
const blocks=[...page.matchAll(/<section id="(P\d{2}-\d{2})" class="scenario" data-group="(P\d{2})">([\s\S]*?)(?=<section id="P\d{2}-\d{2}" class="scenario"|<div class="pain-heading"|<section class="card arch">)/g)];
const ids=[...page.matchAll(/<section id="(P\d{2}-\d{2})" class="scenario"/g)].map(m=>m[1]);
const links=[...page.matchAll(/href="(\/downloads\/[^"]+)"/g)].map(m=>m[1]);
const nav=[...page.matchAll(/class="scenario-link" href="#(P\d{2}-\d{2})"/g)].map(m=>m[1]);
const errors=[];
if(new Set(ids).size!==ids.length)errors.push('Duplicate scenario ID');
if(ids.length!==nav.length||ids.some(id=>!nav.includes(id)))errors.push('Navigation/section ID mismatch');
for(const u of links){if(!fs.existsSync(path.join(root,'public',decodeURIComponent(u))))errors.push('Missing download: '+u)}
for(const [_,id,group,body] of blocks){
 if(id.slice(0,3)!==group)errors.push('Group mismatch: '+id);
 for(const keyword of (Number(id.slice(4)) > ({P01:4,P02:2,P03:2,P04:1,P05:1}[group] ?? 99) ? ['textarea','download','예상 결과','검증','완료 기준'] : ['textarea','download']))if(!body.includes(keyword))errors.push(id+' missing '+keyword);
}
if(blocks.length!==ids.length)errors.push('Scenario parsing mismatch '+blocks.length+'/'+ids.length);
console.log(JSON.stringify({scenarios:ids.length,downloads:links.length,nav:nav.length,checkedBlocks:blocks.length,errors},null,2));
if(errors.length)process.exit(1);
