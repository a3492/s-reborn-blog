import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const exists=(p)=>fs.existsSync(path.join(root,p));
const errors=[];
function check(condition,message){if(!condition)errors.push(message);}
const main='public/tutorials/crm-scenarios/index.html';
const first='public/tutorials/crm-first-analysis/index.html';
const hub='src/pages/lecture-materials/kim-dowi.astro';
const guide='src/pages/tutorials/crm-scenarios/pain-points/index.astro';
const home='src/pages/index.astro';
const base='src/components/BaseHead.astro';
const header='src/components/SiteHeader.astro';
const runtime='public/assets/sreborn-theme-init.js';
const tokens='public/assets/sreborn-theme-tokens.css';
const brand='src/styles/brand-home.css';
const design='src/styles/design.css';
const sources=[main,first,hub,guide,home,base,header,runtime,tokens,brand,design];
for(const p of sources)check(exists(p),'Missing theme contract file: '+p);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
const src=Object.fromEntries(sources.map(p=>[p,read(p)]));
for(const p of [main,hub,guide,first]){
  const s=src[p];
  check(!/70\s*(개|가지|개의)/.test(s),'Stale 70-item count in user-facing page: '+p);
  check(!/PP01\s*[~～-]\s*PP05|5가지\s*페인\s*포인트/.test(s),'Stale five-category copy in: '+p);
}
for(const p of [home,base,main,first]){
  check(src[p].includes('/assets/sreborn-theme-init.js'),'Shared theme JS not loaded: '+p);
  check(src[p].includes('/assets/sreborn-theme-tokens.css'),'Shared theme palette not loaded: '+p);
}
check(src[header].includes('SrebornTheme')&&src[header].includes('theme.save'),'Header picker must use shared runtime');
for(const p of [brand,design]){
  check(src[p].includes('var(--site-bg'),'Background not tied to shared token: '+p);
  check(src[p].includes('var(--site-text'),'Text color not tied to shared token: '+p);
}
for(const p of [main,first]){
  check(src[p].includes('var(--site-bg'),'Standalone lesson background not tied to shared token: '+p);
  check(src[p].includes('var(--site-text'),'Standalone lesson text not tied to shared token: '+p);
  check(src[p].includes('data-theme'),'Standalone lesson missing theme selector contract: '+p);
}
check(src[runtime].includes("'sreborn-theme'"),'Theme runtime storage key mismatch');
check(src[runtime].includes('themePreference'),'Theme runtime must expose user preference');
check(src[runtime].includes("media.addEventListener('change'"),'System-theme change handling required');
check(src[tokens].includes('html[data-theme="dark"]'),'Shared stylesheet needs explicit dark palette');
const ids=[...src[main].matchAll(/<section id="(PP\d{2}-\d{2})" class="scenario"/g)].map(x=>x[1]);
const links=[...src[main].matchAll(/class="scenario-link" href="#(PP\d{2}-\d{2})"/g)].map(x=>x[1]);
check(ids.length>=82,'Baseline CRM scenarios lost: '+ids.length);
check(ids.length===links.length&&new Set(ids).size===ids.length,'Scenario IDs / navigation count mismatch');
check(src[main].includes('const total=sections.length'),'Scenario count must derive from actual nodes, not hardcoded labels');
for(let n=1;n<=8;n++){const id='PP0'+n;check(src[main].includes('data-filter="'+id+'"'),'Missing category filter '+id);check(src[guide].includes('"id": "'+id+'"'),'Missing pain-point guide '+id);}
function contrast(hexA,hexB){
 function lum(hex){const m=hex.match(/^#([\da-f]{6})$/i);if(!m)throw Error('Not a 6-digit color '+hex);const n=m[1],rgb=[0,2,4].map(i=>parseInt(n.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
 const [a,b]=[lum(hexA),lum(hexB)].sort((x,y)=>y-x);return(a+.05)/(b+.05);
}
const palette=src[tokens];const light=palette.split('html[data-theme="dark"]')[0];const dark=palette.split('html[data-theme="dark"]')[1];
for(const [mode,text] of [['light',light],['dark',dark]]){
 const val=k=>text.match(new RegExp('--'+k+':(#[0-9a-fA-F]{6});'))?.[1];
 for(const k of ['site-bg','site-surface','site-text','site-text-secondary','site-mint-text'])check(Boolean(val(k)),mode+' palette missing '+k);
 if(['site-bg','site-surface','site-text','site-text-secondary','site-mint-text'].every(k=>val(k))){
  for(const fg of ['site-text','site-text-secondary','site-mint-text'])for(const bg of ['site-bg','site-surface'])
    check(contrast(val(fg),val(bg))>=4.5,mode+' contrast below 4.5 for '+fg+' on '+bg);
 }
}
// Future standalone HTML under public/tutorials must share the same runtime and palette.
function walk(dir){if(!fs.existsSync(dir))return[];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>{const p=path.join(dir,d.name);return d.isDirectory()?walk(p):[p]});}
const tutorialHtml=walk(path.join(root,'public/tutorials')).filter(p=>p.endsWith('.html'));
for(const absolute of tutorialHtml){const rel=path.relative(root,absolute).replaceAll('\\','/'),s=read(rel);check(s.includes('/assets/sreborn-theme-init.js')&&s.includes('/assets/sreborn-theme-tokens.css'),'Standalone tutorial missing shared site theme: '+rel);}
// If a newly edited standalone HTML page is touched, enforce the contract before publish.
if(process.env.GITHUB_BASE_SHA&&/^[0-9a-f]{40}$/.test(process.env.GITHUB_BASE_SHA)&&!/^0{40}$/.test(process.env.GITHUB_BASE_SHA)){
 try{
  const changed=execFileSync('git',['diff','--name-only',process.env.GITHUB_BASE_SHA,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  for(const rel of changed){
   if(!/\.html$/.test(rel)||!rel.startsWith('public/')||!exists(rel))continue;
   const s=read(rel);
   check(s.includes('/assets/sreborn-theme-init.js')&&s.includes('/assets/sreborn-theme-tokens.css'),'Changed public HTML must use shared theme: '+rel);
  }
 }catch(e){console.warn('Change-scope audit unavailable; base contract still checked:',String(e.message).slice(0,160));}
}
console.log(JSON.stringify({theme:'shared',scenarioCount:ids.length,groups:8,standaloneTutorials:tutorialHtml.length,stale70:'none in audited pages',errors},null,2));
if(errors.length)process.exit(1);
