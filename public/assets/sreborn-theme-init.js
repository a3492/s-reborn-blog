/* S-Reborn shared theme bootstrap. Load synchronously in <head> on every standalone page. */
(function(){
  if (window.SrebornTheme && window.SrebornTheme.version === 1) {
    window.SrebornTheme.apply();
    return;
  }
  const KEY = 'sreborn-theme';
  const MODES = ['system', 'light', 'dark'];
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  function preference(){
    try { const stored = window.localStorage.getItem(KEY); return MODES.includes(stored) ? stored : 'system'; }
    catch (_) { return 'system'; }
  }
  function apply(mode){
    const selected = MODES.includes(mode) ? mode : preference();
    const resolved = selected === 'system' ? (media.matches ? 'dark' : 'light') : selected;
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.dataset.themePreference = selected;
    root.style.colorScheme = resolved;
    document.querySelectorAll('[data-theme-select]').forEach(function(el){ el.value=selected; });
    return resolved;
  }
  function save(mode){
    const selected = MODES.includes(mode) ? mode : 'system';
    try { window.localStorage.setItem(KEY, selected); } catch (_) {}
    const resolved = apply(selected);
    window.dispatchEvent(new CustomEvent('sreborn-theme-change', { detail: { preference: selected, resolved: resolved } }));
  }
  window.SrebornTheme={version:1,key:KEY,preference:preference,apply:apply,save:save};
  apply(preference());
  if(media.addEventListener) media.addEventListener('change',function(){if(preference()==='system')apply('system');});
  window.addEventListener('storage',function(event){if(event.key===KEY)apply(preference());});
})();
