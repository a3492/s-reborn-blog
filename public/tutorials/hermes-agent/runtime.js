/* Hermes training: render trusted lesson data as plain DOM text, not HTML. */
(function () {
  const source = document.getElementById('lesson-data');
  const nav = document.getElementById('lesson-nav');
  const stack = document.getElementById('lesson-stack');
  if (!source || !nav || !stack) return;
  let scenes;
  try { scenes = JSON.parse(source.textContent || '[]'); } catch { return; }
  if (!Array.isArray(scenes)) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }
  function append(parent, ...children) { for (const child of children) parent.appendChild(child); return parent; }
  function namedSection(title, body, cls) {
    const box = el('div', cls);
    append(box, el('strong', null, title), el('p', null, body));
    return box;
  }
  scenes.forEach((s, index) => {
    const navButton = el('button','stepnav');
    navButton.type = 'button';
    navButton.dataset.stepLink = s.id;
    append(navButton, el('span',null,s.number), document.createTextNode(s.title),el('span','done','✓'));
    navButton.querySelector('.done').setAttribute('aria-hidden','true');
    nav.appendChild(navButton);

    const article = el('article','scene');
    article.dataset.scene = s.id;
    article.hidden = index !== 0;
    const top = el('div','scene-top');
    append(top, el('span','sequence', 'STEP '+s.number+' / '+scenes.length), el('span','surface',s.location));
    append(article,top,el('h2',null,s.title));
    const objective = el('p','objective');
    append(objective,el('strong',null,'지금 목표'),document.createTextNode(' '+s.objective));
    append(article,objective,el('h3',null,'왜 이 작업을 하나요?'),el('p',null,s.why),el('h3',null,'지금 해야 할 일'));
    const list=el('ol','actions');
    for(const action of s.actions || []) list.appendChild(el('li',null,action));
    article.appendChild(list);
    for(const command of s.commands || []){
      const block=el('div','command-block');
      const head=el('div','command-head');
      const copy=el('button',null,'복사하기');
      copy.type='button'; copy.dataset.copy=command.text;
      append(head,el('strong',null,command.label),copy);
      const pre=el('pre');append(pre,el('code',null,command.text));
      append(block,head,pre);article.appendChild(block);
    }
    article.appendChild(namedSection('정상이라면 이렇게 됩니다',s.expected,'expect'));
    if(s.caution)article.appendChild(namedSection('확인하세요',s.caution,'caution'));
    const result=el('div','result');
    result.appendChild(el('p',null,'직접 해보셨나요? 결과에 따라 선택하세요.'));
    const buttons=el('div','resultbtn');
    const success=el('button',null,'성공했어요 · 다음 단계');
    success.type='button';success.dataset.success=s.id;
    const fail=el('button',null,'다르게 보여요 · 문제 해결');
    fail.type='button';fail.dataset.error=s.id;
    append(buttons,success,fail);
    append(result,buttons,el('small',null,'성공 여부는 본인이 확인합니다. 웹페이지가 PC 상태를 자동 검증하지 않습니다.'));
    article.appendChild(result);

    const trouble=el('section','trouble');
    trouble.dataset.trouble=s.id;trouble.hidden=true;
    trouble.appendChild(el('h3',null,'어떤 문제가 생겼나요?'));
    for(const pair of s.troubleshoot || []){
      const details=el('details');
      append(details,el('summary',null,pair[0]),el('p',null,pair[1]));
      trouble.appendChild(details);
    }
    const troubleFooter=el('div','trouble-footer');
    const back=el('button',null,'실습으로 돌아가기');
    back.type='button';back.dataset.back=s.id;
    const hubLink=el('a',null,'자료실로 가기');hubLink.href='/tutorials/hermes-agent/';
    append(troubleFooter,back,hubLink);trouble.appendChild(troubleFooter);article.appendChild(trouble);
    const pager=el('div','pager');
    const previous=el('button',null,'← 이전 단계');
    previous.type='button';previous.dataset.prev=s.id;previous.disabled=index===0;
    pager.appendChild(previous);
    if(index<scenes.length-1){
      const next=el('button',null,'다음 단계 →');
      next.type='button';next.dataset.next=s.id;pager.appendChild(next);
    }else{
      const a=el('a',null,'강연 자료실로 돌아가기 →');
      a.href='/tutorials/hermes-agent/';pager.appendChild(a);
    }
    article.appendChild(pager);
    stack.appendChild(article);
  });
})();