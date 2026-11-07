import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),page=fs.readFileSync(path.join(root,'public/tutorials/crm-scenarios/index.html'),'utf8');
const blocks=[...page.matchAll(/<section id="(PP\d{2}-\d{2})" class="scenario" data-group="(PP\d{2})">([\s\S]*?)(?=<span id="P\d{2}-\d{2}" class="legacy-anchor"|<section id="PP\d{2}-\d{2}" class="scenario"|<div class="pain-heading"|<section class="card arch">)/g)];
const ids=[...page.matchAll(/<section id="(PP\d{2}-\d{2})" class="scenario"/g)].map(m=>m[1]);
const links=[...page.matchAll(/href="(\/downloads\/[^"]+)"/g)].map(m=>m[1]);
const nav=[...page.matchAll(/class="scenario-link" href="#(PP\d{2}-\d{2})"/g)].map(m=>m[1]);
const errors=[];
if(new Set(ids).size!==ids.length)errors.push('Duplicate scenario ID');
if(ids.length!==nav.length||ids.some(id=>!nav.includes(id)))errors.push('Navigation/section ID mismatch');
for(const u of links){if(!fs.existsSync(path.join(root,'public',decodeURIComponent(u))))errors.push('Missing download: '+u)}
for(const [_,id,group,body] of blocks){
 if(id.slice(0,4)!==group)errors.push('Group mismatch: '+id);
 for(const keyword of (Number(id.split('-')[1]) > ({PP01:4,PP02:2,PP03:2,PP04:1,PP05:1}[group] ?? 99) ? ['textarea','download','예상 결과','검증','완료 기준'] : ['textarea','download']))if(!body.includes(keyword))errors.push(id+' missing '+keyword);
}
if(blocks.length!==ids.length)errors.push('Scenario parsing mismatch '+blocks.length+'/'+ids.length);
if(ids.length<82)errors.push('Unexpected scenario loss; current baseline is 82');
for(const id of ['PP06','PP07','PP08']){for(let n=1;n<=4;n++){const scenarioId=id+'-'+String(n).padStart(2,'0');if(!ids.includes(scenarioId))errors.push('New scenario missing: '+scenarioId);if(!fs.existsSync(path.join(root,'public/downloads/crm-scenarios',scenarioId+'.txt')))errors.push('New source missing: '+scenarioId);}}
for(let n=1;n<=5;n++){const group='PP0'+n;const count=ids.filter(id=>id.startsWith(group+'-')).length;if(count<({PP01:16,PP02:14,PP03:14,PP04:13,PP05:13}[group]))errors.push('Original group shrank: '+group);}
for(let n=1;n<=8;n++){const group='PP0'+n;if(!page.includes('data-group="'+group+'"'))errors.push('Missing category '+group);if(!page.includes('/pain-points/#'+group))errors.push('Missing category guide link '+group);}
if(!page.includes('sreborn-theme'))errors.push('Theme preference integration absent');
const categoryGroups=[...page.matchAll(/<div class="pain-group" data-group="(PP\d{2})"/g)].map(m=>m[1]);if(categoryGroups.length!==8||new Set(categoryGroups).size!==8)errors.push('Exactly eight unique pain point groups required');
for(const old of ['A','B','C','D','E','F','G','H','I','J'])if(!page.includes('id="'+old+'" class="legacy-anchor"'))errors.push('Legacy anchor missing: '+old);
console.log(JSON.stringify({scenarios:ids.length,downloads:links.length,nav:nav.length,checkedBlocks:blocks.length,errors},null,2));
if(errors.length)process.exit(1);
