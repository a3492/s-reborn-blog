import { chromium } from 'playwright';

const widths = [1440, 768, 390, 320];
const modes = ['light', 'dark', 'system'];
const base = 'http://127.0.0.1:4321/';
const errors = [];
const results = [];
async function ready() {
  for (let n = 0; n < 45; n++) {
    try { const r = await fetch(base); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw Error('Astro preview did not start');
}
await ready();
const browser = await chromium.launch({ headless: true });
try {
  for (const width of widths) {
    for (const mode of modes) {
      const context = await browser.newContext({viewport: {width, height: 900}, colorScheme: mode === 'dark' ? 'dark' : 'light', deviceScaleFactor: 1});
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(width + '/' + mode + ' JS: ' + e.message));
      await page.goto(base, {waitUntil: 'networkidle'});
      await page.locator('[data-theme-select]').selectOption(mode);
      await page.reload({waitUntil: 'networkidle'});
      const result = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('#explore .cards > a.card'));
        const selector = document.querySelector('[data-theme-select]');
        return {
          themePreference: document.documentElement.getAttribute('data-theme-preference'),
          theme: document.documentElement.getAttribute('data-theme'),
          selected: selector?.value,
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          cards: cards.map(c => ({height: Math.round(c.getBoundingClientRect().height), href: c.getAttribute('href'), text: c.innerText.trim(), focusable: c.tabIndex >= 0, visible: getComputedStyle(c).display !== 'none'}))
        };
      });
      if (result.themePreference !== mode || result.selected !== mode) errors.push(width + '/' + mode + ' theme preference not preserved: ' + JSON.stringify(result));
      if (result.overflow > 2) errors.push(width + '/' + mode + ' horizontal overflow: ' + result.overflow);
      if (result.cards.length !== 3) errors.push(width + '/' + mode + ' expected three explore cards');
      for (const card of result.cards) {
        if (!card.visible || !card.focusable || !card.href) errors.push(width + '/' + mode + ' invalid card: ' + JSON.stringify(card));
        if (card.height > (width <= 820 ? 220 : 230)) errors.push(width + '/' + mode + ' oversized card: ' + card.height);
      }
      if (width <= 768) {
        const toggle = page.locator('[data-nav-toggle]');
        await toggle.click();
        if (await toggle.getAttribute('aria-expanded') !== 'true') errors.push(width + '/' + mode + ' mobile menu did not open');
        await page.locator('[data-nav-close]').click();
        if (await toggle.getAttribute('aria-expanded') !== 'false') errors.push(width + '/' + mode + ' mobile menu did not close');
      }
      await page.screenshot({path: 'qa-screenshots/home-' + width + '-' + mode + '.png', fullPage: true});
      results.push({width,mode,...result});
      await context.close();
    }
  }
} finally { await browser.close(); }
console.log(JSON.stringify({results, errors},null,2));
if (errors.length) process.exitCode = 1;
