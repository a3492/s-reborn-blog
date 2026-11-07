/* Hermes Agent training interactions. No credentials are collected. */
const steps = ['ready','bot','userid','env','gateway','reply','finish'];
  const storageKey = 'sreborn-hermes-ep02-progress-v1';
  let finished = new Set();
  let current = 'ready';
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (Array.isArray(data.done)) finished = new Set(data.done.filter((x)=>typeof x==='string' && steps.includes(x)));
    if (typeof data.current==='string' && steps.includes(data.current)) current=data.current;
  } catch {}
  const label = document.getElementById('status-label');
  const count = document.getElementById('progress-label');
  const progress = document.getElementById('progress-track');
  const fill = document.getElementById('progress-fill');
  const save = () => { try { localStorage.setItem(storageKey,JSON.stringify({done:[...finished],current})); } catch {} };
  const render = () => {
    document.querySelectorAll('[data-scene]').forEach(el=>{el.hidden=el.dataset.scene!==current;});
    document.querySelectorAll('[data-step-link]').forEach(el=>{el.classList.toggle('active',el.dataset.stepLink===current);el.classList.toggle('completed',finished.has(el.dataset.stepLink||''));el.setAttribute('aria-current',el.dataset.stepLink===current?'step':'false');});
    const idx=steps.indexOf(current);
    const title=document.querySelector(`[data-scene="${current}"] h2`)?.textContent||'';
    if(label)label.textContent=`${String(idx+1).padStart(2,'0')} / 07 · ${title}`;
    if(count)count.textContent=`완료 체크 ${finished.size} / ${steps.length}`;
    progress?.setAttribute('aria-valuenow',String(finished.size));
    if(fill)fill.style.width=`${finished.size/steps.length*100}%`;
    save();
  };
  const go=(id) => {if(!steps.includes(id))return;current=id;render();document.querySelector('.steps')?.scrollIntoView({block:'start',behavior:'smooth'});};
  document.querySelectorAll('[data-step-link],[data-jump]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.stepLink||el.dataset.jump||'')));
  document.querySelectorAll('[data-next]').forEach(el=>el.addEventListener('click',()=>{const i=steps.indexOf(el.dataset.next||'');if(i>=0&&i<steps.length-1)go(steps[i+1]);}));
  document.querySelectorAll('[data-prev]').forEach(el=>el.addEventListener('click',()=>{const i=steps.indexOf(el.dataset.prev||'');if(i>0)go(steps[i-1]);}));
  document.querySelectorAll('[data-success]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.success||'';finished.add(id);const i=steps.indexOf(id);go(steps[Math.min(i+1,steps.length-1)]);}));
  document.querySelectorAll('[data-error]').forEach(el=>el.addEventListener('click',()=>{const t=document.querySelector(`[data-trouble="${el.dataset.error}"]`);if(t){t.hidden=false;t.scrollIntoView({block:'nearest',behavior:'smooth'});}}));
  document.querySelectorAll('[data-back]').forEach(el=>el.addEventListener('click',()=>{const t=document.querySelector(`[data-trouble="${el.dataset.back}"]`);if(t)t.hidden=true;}));
  document.querySelectorAll('[data-copy]').forEach(el=>el.addEventListener('click',async()=>{const value=el.dataset.copy||'';const original='복사하기';try{await navigator.clipboard.writeText(value);el.textContent='복사됨 ✓';setTimeout(()=>el.textContent=original,1800);}catch{const pre=el.closest('.command-block')?.querySelector('code');if(pre){const range=document.createRange();range.selectNodeContents(pre);const s=window.getSelection();s?.removeAllRanges();s?.addRange(range);}el.textContent='텍스트를 선택했어요';setTimeout(()=>el.textContent=original,2400);}}));
  document.getElementById('reset-progress')?.addEventListener('click',()=>{if(confirm('이 브라우저에 저장한 EP02 진도를 초기화할까요?')){finished.clear();current='ready';render();}});
  render();
