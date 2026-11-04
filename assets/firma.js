/* PalmApp – firemní web: navigace, animace, demo, kalkulačka, konfigurátor */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return Math.round(n).toLocaleString('cs-CZ').replace(/ /g, ' '); };

  /* ---------- nav ---------- */
  var nav = $('.nav');
  var onScroll = function () { if (nav) nav.classList.toggle('stuck', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  $$('[data-mega]').forEach(function (btn) {
    var li = btn.parentElement;
    var set = function (v) { btn.setAttribute('aria-expanded', String(v)); };
    li.addEventListener('mouseenter', function () { set(true); });
    li.addEventListener('mouseleave', function () { set(false); });
    li.addEventListener('focusin', function () { set(true); });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && li.contains(document.activeElement)) { document.activeElement.blur(); set(false); } });
  });

  var burger = $('.burger'), drawer = $('.drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open)); drawer.classList.toggle('open', !open);
      document.body.style.overflow = open ? '' : 'hidden';
    });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { burger.click(); }); });
  }

  /* ---------- reveal ---------- */
  var rv = $$('[data-reveal],.tl,[data-ring]');
  if (reduced || !('IntersectionObserver' in window)) rv.forEach(function (el) { el.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count-up čísel ---------- */
  $$('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count')), suffix = el.getAttribute('data-suffix') || '';
    var run = function () {
      if (reduced) { el.textContent = fmt(target) + suffix; return; }
      var t0 = null;
      var step = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400); p = 1 - Math.pow(1 - p, 3); el.textContent = fmt(target * p) + suffix; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) return run();
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .6 });
    o.observe(el);
  });

  /* ---------- range fill ---------- */
  var paintRange = function (r) { var p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty('--fill', p + '%'); };
  $$('input[type=range]').forEach(function (r) { paintRange(r); r.addEventListener('input', function () { paintRange(r); }); });

  /* ======================================================
     DEMO: jedna zpráva → verze pro každou skupinu
     ====================================================== */
  var DEMO = {
    smeny: {
      src: 'Od 1. listopadu se mění rozpis směn ve výrobě. Ranní směna začíná v 6:00 místo 5:30. Kancelářská pracovní doba se nemění. Vedoucí směn dostanou nové rozpisy do pátku.',
      out: {
        vyroba: 'Od 1. 11. začíná ranní směna v 6:00 (ne v 5:30). Nový rozpis uvidíte v aplikaci do pátku.',
        kancelar: 'Pro vás se nic nemění, pracovní doba zůstává stejná. Ve výrobě se od 1. 11. posouvá ranní směna na 6:00.',
        vedouci: 'Do pátku dostanete nové rozpisy směn. Od 1. 11. začíná ranní směna v 6:00, prosím informujte svůj tým.',
        novi: 'Vítejte! Ranní směna začíná od 1. 11. v 6:00. Rozpis najdete v aplikaci v sekci Dokumenty.',
        ua: 'Від 1.11 ранкова зміна починається о 6:00 (а не о 5:30). Новий графік з’явиться в застосунку до п’ятниці.'
      }
    },
    akce: {
      src: 'V pátek 14. listopadu pořádáme firemní den v areálu závodu od 14:00. Bude program pro rodiny a občerstvení. Výroba má ten den zkrácenou odpolední směnu do 13:30. Účast prosím potvrďte do 7. listopadu.',
      out: {
        vyroba: '14. 11. končí odpolední směna už ve 13:30 a od 14:00 začíná firemní den v areálu. Účast potvrďte v aplikaci do 7. 11.',
        kancelar: 'Firemní den 14. 11. od 14:00 v areálu závodu, s programem pro rodiny a občerstvením. Potvrďte účast do 7. 11.',
        vedouci: '14. 11. je zkrácená odpolední směna do 13:30. Zkontrolujte obsazení a připomeňte týmu potvrzení účasti do 7. 11.',
        novi: 'Skvělá příležitost poznat kolegy: firemní den 14. 11. od 14:00. Stačí potvrdit účast v aplikaci do 7. 11.',
        ua: '14.11 післяобідня зміна закінчується вже о 13:30, а о 14:00 починається корпоративне свято на території заводу. Підтвердіть участь у застосунку до 7.11.'
      }
    },
    bozp: {
      src: 'Od pondělí je ve skladu povinné nosit reflexní vestu po celou dobu směny, včetně přestávek ve venkovním areálu. Vesty jsou k vyzvednutí u vedoucího směny. Školení proběhne online v aplikaci.',
      out: {
        vyroba: 'Od pondělí: reflexní vesta po celou směnu, i o přestávkách venku. Vyzvednete si ji u vedoucího směny. Krátké školení najdete v aplikaci.',
        kancelar: 'Když jdete do skladu nebo venkovního areálu, vezměte si reflexní vestu. Od pondělí je povinná.',
        vedouci: 'Od pondělí vydávejte reflexní vesty a kontrolujte jejich nošení po celou směnu. Školení týmu proběhne v aplikaci.',
        novi: 'Bezpečnost na prvním místě: ve skladu vždy noste reflexní vestu. Vyzvednete si ji u vedoucího směny.',
        ua: 'З понеділка світловідбивний жилет обов’язковий протягом усієї зміни, також під час перерв надворі. Отримати його можна в керівника зміни. Коротке навчання знайдете в застосунку.'
      }
    }
  };
  var demo = $('[data-demo]');
  if (demo) {
    var src = $('.demo-src', demo), current = 'smeny', timers = [];
    var setPreset = function (k) {
      current = k; src.value = DEMO[k].src;
      $$('.pchip', demo).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.preset === k)); });
      $$('.outcard', demo).forEach(function (c) { c.classList.remove('live'); $('.bubble', c).textContent = 'Klikněte na „Připravit verze“.'; });
    };
    $$('.pchip', demo).forEach(function (b) { b.addEventListener('click', function () { setPreset(b.dataset.preset); }); });
    $$('.gchip', demo).forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        if (!on && $$('.gchip[aria-pressed="true"]', demo).length === 1) return;
        b.setAttribute('aria-pressed', String(on));
        var card = $('.outcard[data-g="' + b.dataset.g + '"]', demo); if (card) card.hidden = !on;
      });
    });
    src.addEventListener('input', function () { $$('.pchip', demo).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); });
    var type = function (el, text, delay) {
      timers.push(setTimeout(function () {
        if (reduced) { el.textContent = text; return; }
        var i = 0; el.innerHTML = '<span></span><span class="caret"></span>';
        var span = el.firstChild;
        var tick = function () { i += 2; span.textContent = text.slice(0, i); if (i < text.length) timers.push(setTimeout(tick, 16)); else el.lastChild.remove(); };
        tick();
      }, delay));
    };
    $('.demo-go', demo).addEventListener('click', function () {
      timers.forEach(clearTimeout); timers = [];
      var data = DEMO[current];
      var custom = !$$('.pchip[aria-pressed="true"]', demo).length;
      $$('.outcard', demo).filter(function (c) { return !c.hidden; }).forEach(function (c, k) {
        c.classList.add('live');
        var text = custom ? '[Ukázka funguje s připravenými zprávami. Vlastní text v aplikaci přizpůsobí Generátor.]' : data.out[c.dataset.g];
        type($('.bubble', c), text, k * 420);
      });
    });
    setPreset('smeny');
  }

  /* ---------- kontakt: předvyplnění z kalkulačky / konfigurátoru ---------- */
  var form = $('[data-contact]');
  if (form) {
    var p = new URLSearchParams(location.search);
    var msg = [];
    var PK = { zaklad: 'Základ', asistent: 'Asistent', komplet: 'Komplet' };
    if (p.get('zdroj') === 'kalkulacka') msg.push('Spočítal(a) jsem si přínos v kalkulačce: ' + p.get('zamestnanci') + ' zaměstnanců, ' + p.get('zavody') + ' závod(y), balíček ' + (PK[p.get('balicek')] || '') + (p.get('panel') ? ' + Panel služeb' : '') + '.');
    var MN = { komunikace: 'interní komunikace', dokumenty: 'dokumenty', generator: 'Stories a Generátor', asistent: 'AI asistent', panel: 'Panel služeb', ewa: 'výběr mzdy' };
    if (p.get('zdroj') === 'konfigurator')
      msg.push('Z konfigurátoru: balíček ' + (PK[p.get('balicek')] || '') + ', moduly: ' + (p.get('moduly') || '').split(',').map(function (k) { return MN[k] || k; }).join(', ') + '.');
    if (!p.get('zdroj') && PK[p.get('balicek')]) msg.push('Zajímá mě balíček ' + PK[p.get('balicek')] + '.');
    if (p.get('navrh')) msg.push('Spočítal(a) jsem si orientační cenu: ' + p.get('navrh') + '.');
    var zj = p.get('zajem'); if (zj) { var zr = $('input[name="typ"][value="' + zj + '"]', form); if (zr) zr.checked = true; }
    if (msg.length) { var t = $('textarea', form); t.value = msg.join('\n') + '\n'; }
    /* obor = klasifikace leadu: pink (HR) · blue (servis) · white (obchodní sítě) · jine */
    var segIn = $$('input[name="segment"]', form);
    var showSeg = function (v) {
      $$('[data-for]', form).forEach(function (g) { g.hidden = g.getAttribute('data-for').split(' ').indexOf(v) < 0; });
      var z = $('[data-zajem]', form); if (z) z.hidden = !v || v === 'jine';
    };
    var sp = p.get('segment') || (p.get('zdroj') ? 'pink' : '');
    segIn.forEach(function (r) { if (r.value === sp) r.checked = true; r.addEventListener('change', function () { showSeg(r.value); }); });
    showSeg(sp);
    var emp = p.get('zamestnanci'); if (emp) { var s = $('select[name="velikost"]', form); var n = +emp; s.value = n <= 50 ? '1-50' : n <= 200 ? '51-200' : n <= 500 ? '201-500' : n <= 1000 ? '501-1000' : '1000+'; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      /* TODO: napojit na backend / e-mail obchodu. Pole "segment" (pink/blue/white/jine) = klasifikace leadu pro CRM a výběr master prezentace. */
      var ok = $('[data-sent]'); if (ok) { form.hidden = true; ok.hidden = false; ok.scrollIntoView({ block: 'center' }); }
    });
  }

  /* ---------- subnav: aktivní sekce ---------- */
  var sub = $$('.subnav a');
  if (sub.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) sub.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sub.forEach(function (a) { var t = document.querySelector(a.getAttribute('href')); if (t) so.observe(t); });
  }
})();

/* ---------- scrollem řízené efekty (stejné jako zaměstnanecká část) ---------- */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var ease = function (p) { return 1 - Math.pow(1 - p, 3); };
  var nav = document.getElementById('nav');
  var navBtn = nav && nav.querySelector('.nav-cta a');
  var hero = document.getElementById('hero');
  var heroSec = hero && hero.parentElement;
  var curtains = Array.prototype.slice.call(document.querySelectorAll('[data-curtain]'));

  /* statement: rozdělit na slova */
  var st = document.querySelector('[data-statement]'), words = [];
  if (st) {
    var p = st.querySelector('.statement-text');
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) split(n);
      });
    })(p);
    words = p.querySelectorAll('.w');
    p.querySelectorAll('.hl .w').forEach(function (w) { w.classList.add('hl'); });
  }

  var ticking = false;
  function update() {
    var H = window.innerHeight, y = window.scrollY, r, q;
    if (nav) { var stuck = y > 24; nav.classList.toggle('stuck', stuck); if (navBtn) navBtn.tabIndex = stuck ? 0 : -1; }
    if (!reduced) {
      if (hero && heroSec) { r = heroSec.getBoundingClientRect(); hero.style.setProperty('--p', clamp(-r.top / r.height).toFixed(4)); }
      if (words.length) {
        r = st.getBoundingClientRect();
        q = clamp((-r.top + H * 0.25) / (r.height - H * 0.75));
        var lit = q * (words.length + 4);
        for (var i = 0; i < words.length; i++) words[i].style.opacity = (0.12 + 0.88 * clamp(lit - i)).toFixed(3);
      }
      curtains.forEach(function (el) {
        r = el.parentElement.getBoundingClientRect();
        el.style.setProperty('--p', ease(clamp((H - r.top) / (H * 1.1))).toFixed(4));
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- hub: čáry vstupy → PalmApp → výstupy ---------- */
(function () {
  var wrap = document.querySelector('[data-hubwrap]'); if (!wrap) return;
  var svg = wrap.querySelector('.hub-svg'), core = wrap.querySelector('[data-hub-core]');
  var NS = 'http://www.w3.org/2000/svg';
  function draw() {
    if (getComputedStyle(svg).display === 'none') return;
    var W = wrap.getBoundingClientRect(), C = core.getBoundingClientRect();
    var cx = C.left + C.width / 2 - W.left, cy = C.top + C.height / 2 - W.top, r = C.width / 2;
    svg.setAttribute('viewBox', '0 0 ' + W.width + ' ' + W.height);
    svg.innerHTML = '';
    var k = 0;
    wrap.querySelectorAll('.hub-col--in [data-hub], .hub-col--out [data-hub]').forEach(function (n) {
      var R = n.getBoundingClientRect(), out = !!n.closest('.hub-col--out');
      var y = R.top + R.height / 2 - W.top;
      var x1 = out ? cx + r * 0.92 : R.right - W.left, y1 = out ? cy : y;
      var x2 = out ? R.left - W.left : cx - r * 0.92, y2 = out ? y : cy;
      var mx = (x1 + x2) / 2;
      var d = 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2;
      var a = document.createElementNS(NS, 'path'); a.setAttribute('d', d); a.setAttribute('class', 'hub-line'); svg.appendChild(a);
      var b = document.createElementNS(NS, 'path'); b.setAttribute('d', d); b.setAttribute('class', 'hub-pulse');
      b.style.animationDelay = (out ? 1.6 : 0) + (k++ % 5) * 0.35 + 's'; svg.appendChild(b);
    });
  }
  window.addEventListener('resize', draw);
  window.addEventListener('load', draw);
  setTimeout(draw, 50); setTimeout(draw, 1300);
})();

/* ---------- timeline řízený scrollem ---------- */
(function () {
  var tls = document.querySelectorAll('[data-tlscroll]'); if (!tls.length) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function upd() {
    var H = window.innerHeight;
    tls.forEach(function (tl) {
      var r = tl.getBoundingClientRect();
      var p = reduced ? 1 : Math.max(0, Math.min(1, (H * 0.8 - r.top) / (H * 0.45)));
      tl.style.setProperty('--p', p.toFixed(4));
      var st = tl.querySelectorAll('.st');
      st.forEach(function (s, i) { s.classList.toggle('on', p >= (st.length > 1 ? i / (st.length - 1) : 0) * 0.98); });
    });
  }
  window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
})();

/* ---------- situace: přehrávač ---------- */
(function () {
  var wrap = document.querySelector('[data-scn-wrap]'); if (!wrap) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tabs = wrap.querySelectorAll('.scn-tab'), panels = wrap.querySelectorAll('.scn-panel');
  var i = 0, timer = null, user = false, visible = false;
  function show(n) {
    i = n;
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === n)); var b = t.querySelector('.scn-bar'); b.style.animation = 'none'; b.offsetWidth; b.style.animation = ''; });
    panels.forEach(function (p, k) { p.hidden = k !== n; });
  }
  function tick() { if (!user && visible) show((i + 1) % tabs.length); }
  function start() { if (reduced || user) return; wrap.classList.add('auto'); clearInterval(timer); timer = setInterval(tick, 6000); }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { user = true; wrap.classList.remove('auto'); clearInterval(timer); show(k); });
    t.addEventListener('keydown', function (e) {
      var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
      if (d) { e.preventDefault(); var n = (k + d + tabs.length) % tabs.length; tabs[n].focus(); tabs[n].click(); }
    });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) { show(i); start(); } else clearInterval(timer); }, { threshold: .35 }).observe(wrap);
  }
})();

/* ---------- walkthrough: aktivní krok ---------- */
(function () {
  var wt = document.querySelector('[data-wt]'); if (!wt) return;
  var steps = wt.querySelectorAll('.wt-step'), scenes = wt.querySelectorAll('.wt-stage .mu-scene'), dots = wt.querySelectorAll('.wt-dots i');
  var active = -1;
  function set(i) {
    if (i === active) return; active = i;
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    scenes.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
  }
  function upd() {
    var mid = window.innerHeight / 2, best = 0;
    steps.forEach(function (s, k) { if (s.getBoundingClientRect().top < mid) best = k; });
    set(best);
  }
  window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
})();

/* ---------- homepage: Kde PalmApp pomůže nejvíc – scroll storytelling ---------- */
(function () {
  var st = document.querySelector('[data-story]'); if (!st) return;
  var items = st.querySelectorAll('.story-item'), scenes = st.querySelectorAll('.story-scene'), n = items.length, cur = -1;
  var mq = window.matchMedia('(max-width:960px)');
  function upd() {
    if (mq.matches) { items.forEach(function (it) { it.classList.add('on'); it.style.setProperty('--p', 0); }); return; }
    var r = st.getBoundingClientRect(), span = Math.max(1, st.offsetHeight - window.innerHeight);
    var p = Math.min(1, Math.max(0, -r.top / span));
    var k = Math.min(n - 1, Math.floor(p * n)), local = Math.min(1, p * n - k);
    items.forEach(function (it, j) { it.classList.toggle('on', j === k); it.style.setProperty('--p', j < k ? 1 : (j === k ? local.toFixed(3) : 0)); });
    if (k !== cur) { cur = k; st.setAttribute('data-active', String(k)); scenes.forEach(function (s, j) { s.classList.toggle('on', j === k); }); }
  }
  window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
})();

/* ---------- homepage (index5): akordeon řízený scrollem ---------- */
(function () {
  var st = document.querySelector('[data-acc]'); if (!st) return;
  var rows = st.querySelectorAll('.acc-row'), n = rows.length;
  var mq = window.matchMedia('(max-width:960px)');
  function upd() {
    if (mq.matches) { rows.forEach(function (r) { r.classList.add('on'); }); return; }
    var r = st.getBoundingClientRect(), span = Math.max(1, st.offsetHeight - window.innerHeight);
    var p = Math.min(1, Math.max(0, -r.top / span));
    var k = Math.min(n - 1, Math.floor(p * n)), local = Math.min(1, p * n - k);
    rows.forEach(function (row, j) { row.classList.toggle('on', j === k); row.style.setProperty('--p', j === k ? local.toFixed(3) : 0); });
  }
  window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
})();

/* ---------- homepage (index9): vrstvené karty oborů ---------- */
(function () {
  var list = document.querySelector('[data-stack]'); if (!list) return;
  var cards = Array.prototype.slice.call(list.querySelectorAll('.stack-card'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches, ticking = false;
  function upd() {
    var H = window.innerHeight;
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      if (r.top < H * 0.62) c.classList.add('is-on');
      if (reduced) return;
      var nx = cards[i + 1];
      if (!nx) { c.style.setProperty('--s', 1); c.style.setProperty('--dim', 0); return; }
      var nr = nx.getBoundingClientRect(), stick = parseFloat(getComputedStyle(nx).top) || 0;
      var p = Math.min(1, Math.max(0, 1 - (nr.top - stick) / Math.max(1, c.offsetHeight)));
      c.style.setProperty('--s', (1 - 0.06 * p).toFixed(4));
      c.style.setProperty('--dim', (0.38 * p).toFixed(3));
    });
    ticking = false;
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }
  window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req); upd();
})();

/* ---------- homepage (index10): rozevírací panely oborů ---------- */
(function () {
  var sec = document.querySelector('[data-panels]'); if (!sec) return;
  var items = Array.prototype.slice.call(sec.querySelectorAll('.pan-item')), cur = 0, timer = null, paused = false;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(k) {
    cur = k;
    items.forEach(function (it, j) { it.classList.toggle('on', j === k); it.setAttribute('aria-expanded', String(j === k)); var b = it.querySelector('.pan-bar i'); if (b) { b.style.animation = 'none'; b.offsetWidth; b.style.animation = ''; } });
  }
  function start() { if (reduced || paused || timer) return; sec.classList.add('auto'); timer = setInterval(function () { set((cur + 1) % items.length); }, 6000); }
  function stop() { clearInterval(timer); timer = null; sec.classList.remove('auto'); }
  items.forEach(function (it, j) {
    it.addEventListener('mouseenter', function () { paused = true; stop(); set(j); });
    it.addEventListener('focusin', function () { paused = true; stop(); set(j); });
    it.addEventListener('click', function () { paused = true; stop(); set(j); });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { sec.classList.add('in'); setTimeout(start, 1200); } else stop(); });
    }, { threshold: 0.35 }).observe(sec);
  } else { sec.classList.add('in'); }
})();

/* ---------- oborové stránky: kalkulačka ztráty času ---------- */
(function () {
  var c = document.querySelector('[data-losscalc]'); if (!c) return;
  var fmt = function (v) { return Math.round(v).toLocaleString('cs-CZ') + ' Kč'; };
  var val = function (n) { return parseFloat(c.querySelector('[name="' + n + '"]').value) || 0; };
  var set = function (k, v) { var el = c.querySelector('[data-lo="' + k + '"]'); if (el) el.textContent = v; };
  function upd() {
    c.querySelectorAll('input[type=range]').forEach(function (i) {
      i.style.setProperty('--fill', ((i.value - i.min) / (i.max - i.min) * 100) + '%');
      var o = c.querySelector('output[for="' + i.id + '"]');
      if (o) o.textContent = i.dataset.fmt === 'kc' ? fmt(+i.value) : i.value + (i.dataset.suf || '');
    });
    var hours = val('min') / 60 * val('tech') * 20, month = hours * val('rate');
    set('month', fmt(month)); set('year', fmt(month * 12)); set('hours', Math.round(hours).toLocaleString('cs-CZ') + ' h');
  }
  c.addEventListener('input', upd); upd();
})();

/* ---------- servis: ukázky zpráv (seznam + scéna, auto přepínání) ---------- */
(function () {
  var cs = document.querySelector('[data-chatstory]'); if (!cs) return;
  var items = Array.prototype.slice.call(cs.querySelectorAll('.story-item')), scenes = cs.querySelectorAll('.story-scene'), cur = 0, timer = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(k) {
    cur = k; cs.setAttribute('data-active', String(k));
    items.forEach(function (it, j) { it.classList.toggle('on', j === k); var b = it.querySelector('button'); if (b) b.setAttribute('aria-pressed', String(j === k)); var i = it.querySelector('.story-bar i'); if (i) { i.style.animation = 'none'; i.offsetWidth; i.style.animation = ''; } });
    scenes.forEach(function (s, j) { s.classList.toggle('on', j === k); });
  }
  function start() { if (reduced || timer) return; cs.classList.add('auto'); timer = setInterval(function () { set((cur + 1) % items.length); }, 5000); }
  function stop() { clearInterval(timer); timer = null; cs.classList.remove('auto'); }
  items.forEach(function (it, j) { it.querySelector('button').addEventListener('click', function () { stop(); set(j); }); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); }); }, { threshold: 0.4 }).observe(cs);
})();

/* ======================================================
   CENÍK: kalkulačka pro HR, servis a obchodní sítě
   Ceny bez DPH. Servis a sítě podle návrhu ceníku z 2. 11. 2026.
   ====================================================== */
(function () {
  'use strict';
  var roots = document.querySelectorAll('[data-pricecalc]');
  if (!roots.length) return;
  var ANNUAL = 0.8; /* 12 měsíců předem: −20 % */
  var nf = function (n, dec) { return n.toLocaleString('cs-CZ', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }).replace(/\s/g, ' '); };
  var kc = function (n, dec) { return nf(n, dec) + ' Kč'; };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var CONTACT = { hr: 'pink', servis: 'blue', sit: 'white' };
  var ICO = {
    AI: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 1 1 16.1-3.8z"/>',
    DOC: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    VID: '<rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3"/>',
    INFO: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    START: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/>',
    HUB: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    GEN: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
    EWA: '<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="2.5"/>'
  };

  /* ---------- definice segmentů ---------- */
  var SEG = {
    hr: {
      tab: 'HR a zaměstnanci', dot: 'pink',
      title: 'Aplikace pro HR a zaměstnance',
      steps: [
        { key: 'vel', t: 'Kolik máte zaměstnanců', opts: [['s', 'do 100'], ['m', '101–500'], ['l', '501–2 000'], ['xl', '2 001+']] },
        { key: 'need', t: 'O co máte zájem', multi: true, opts: [['komunikace', 'Interní komunikace a novinky'], ['generator', 'Novinky na míru v Generátoru'], ['asistent', 'Textový a hlasový AI asistent'], ['dokumenty', 'Dokumenty v mobilu'], ['panel', 'Rozcestník firemních služeb'], ['ewa', 'Výběr mzdy jako benefit']] }
      ],
      def: { obor: 'vyroba', vel: 'm', zavody: 1, need: ['komunikace', 'asistent'], pay: 'm' }
    },
    servis: {
      tab: 'Servis a terén', dot: 'blue',
      title: 'AI servisní asistent',
      steps: [
        { key: 'presetN', t: 'Kolik máte zaměstnanců', opts: [['20', '20'], ['40', '40'], ['100', '100'], ['200', '200'], ['500', '500'], ['1000', '1 000'], ['2500', '2 500']] },
        { key: 'need', t: 'O co máte zájem', multi: true, opts: [['manualy', 'Manuály a know-how na jednom místě'], ['asistent', 'Textový a hlasový AI asistent'], ['video', 'Videonávody a školení'], ['novinky', 'Technické novinky'], ['rozcestnik', 'Rozcestník pro vaše služby'], ['ewa', 'Výběr mzdy pro zaměstnance']] }
      ],
      def: { obor: 'stroje', vel: 'm', presetN: '200', n: 200, need: ['manualy', 'asistent'], pay: 'm' }
    },
    sit: {
      tab: 'Obchodní sítě', dot: 'white',
      title: 'AI asistent pro obchodní sítě',
      steps: [
        { key: 'presetN', t: 'Kolik máte zaměstnanců', opts: [['25', '25'], ['50', '50'], ['100', '100'], ['200', '200'], ['500', '500'], ['1000', '1 000']] },
        { key: 'need', t: 'O co máte zájem', multi: true, opts: [['produkty', 'Produkty a postupy na jednom místě'], ['asistent', 'Textový a hlasový AI asistent'], ['kampane', 'Kampaně a obchodní novinky'], ['novacci', 'Školení a start nováčků'], ['nastroje', 'Rozcestník portálů a nástrojů']] }
      ],
      def: { obor: 'kosmetika', presetN: '200', n: 200, need: ['produkty', 'asistent'], pay: 'm' }
    }
  };

  /* ---------- výpočty ---------- */
  var HR_PKG = { zaklad: ['Základ', 0], asistent: ['Asistent', 2475], komplet: ['Komplet', 6250] };
  var HR_PANEL = 6500, HR_ZAVOD = 12500;
  var HR_MOD = {
    komunikace: ['INFO', 'Interní komunikace a novinky', 'Zprávy a upozornění přímo do telefonu, i lidem bez firemního e-mailu.'],
    dokumenty: ['DOC', 'Dokumenty', 'Výplatní pásky, smlouvy a směrnice v mobilu.'],
    generator: ['GEN', 'PalmApp Generátor a Stories', 'Z krátkého zadání novinky pro každé oddělení a jazyk, ve stylu vaší firmy.'],
    asistent: ['AI', 'AI asistent hlasem i textem', 'Odpovídá na opakované dotazy podle vašich směrnic.'],
    panel: ['HUB', 'Panel služeb', 'Jídelna, parkování a firemní systémy na jednom místě.'],
    ewa: ['EWA', 'Výběr mzdy jako benefit', 'Firma po implementaci neplatí nic měsíčně.']
  };
  var SIZE_L = { s: 'do 100', m: '101–500', l: '501–2 000', xl: '2 001+' };
  var SIZE_K = { s: 'Firma do 100 zaměstnanců', m: 'Firma se 101–500 zaměstnanci', l: 'Firma s 501–2 000 zaměstnanci', xl: 'Firma s více než 2 000 zaměstnanci' };

  var SV_BAND = { s: { max: 100, rate: 69, od: true, impl: 8900 }, m: { max: 500, rate: 59, od: false, impl: 17900 }, l: { max: 2000, rate: 49, od: true, impl: 38900 }, xl: { max: Infinity, rate: 39, od: true, impl: 59000 } };
  var SV_AI = {
    stroje: 'Odpovědi ze servisních manuálů strojů, s dohledatelným zdrojem.',
    klima: 'Chybové kódy a postupy pro jednotky a čerpadla, s dohledatelným zdrojem.',
    elektro: 'Bezpečné postupy a poruchy střídačů i rozvaděčů, s dohledatelným zdrojem.',
    budovy: 'Plány údržby a postupy pro technologie budov, s dohledatelným zdrojem.',
    zdravotni: 'Servisní postupy a kontroly přístrojů, s dohledatelným zdrojem.',
    jine: 'Odpovědi podle vaší dokumentace, s dohledatelným zdrojem.'
  };
  var SIT_AI = {
    kosmetika: 'Složení, použití a aktuální kampaně z podkladů centrály.',
    dum: 'Varianty, lhůty a obchodní pravidla pro dveře, okna, kuchyně a podlahy.',
    auto: 'Produktové listy, sezónní akce a reklamační postupy.',
    technika: 'Sortiment, parametry a schválené odpovědi zákazníkům.',
    energie: 'Schválené nabídky, kampaně a postupy sjednání.',
    potraviny: 'Produktové listy, sortiment a postupy objednávání.',
    reality: 'Checklisty k zakázkám, obchodní postupy a pravidla centrály.',
    finance: 'Schválené metodiky, produktové informace a procesní postupy.',
    jine: 'Produktové informace a pravidla z vašich podkladů.'
  };
  var sitMonthly = function (n) {
    var ext = 0, a = Math.max(0, Math.min(n, 100) - 25), b = Math.max(0, Math.min(n, 500) - 100), c = Math.max(0, n - 500);
    ext = a * 59 + b * 49 + c * 29;
    return { base: 8900, ext: ext, extUsers: Math.max(0, n - 25), total: 8900 + ext };
  };

  var interests = function (seg, st) {
    var step = SEG[seg].steps.filter(function (x) { return x.key === 'need'; })[0], lab = step.opts.filter(function (o) { return st.need.indexOf(o[0]) > -1; }).map(function (o) { return o[1].charAt(0).toLowerCase() + o[1].slice(1); });
    return lab.length ? ' · zájem: ' + lab.join(', ') : '';
  };
  var compute = {
    hr: function (st) {
      var need = st.need, mods = ['komunikace', 'dokumenty'];
      var gen = need.indexOf('generator') > -1;
      var asis = need.indexOf('asistent') > -1;
      if (gen) mods.push('generator');
      if (asis || gen) mods.push('asistent');
      if (need.indexOf('panel') > -1) mods.push('panel');
      if (need.indexOf('ewa') > -1) mods.push('ewa');
      var pkg = gen ? 'komplet' : asis ? 'asistent' : 'zaklad';
      var z = Math.max(1, st.zavody | 0);
      var lines = [['Balíček ' + HR_PKG[pkg][0], HR_PKG[pkg][1]]];
      if (mods.indexOf('panel') > -1) lines.push(['Panel služeb', HR_PANEL]);
      if (z > 1) lines.push(['Další závody: ' + (z - 1) + ' × ' + kc(HR_ZAVOD), (z - 1) * HR_ZAVOD]);
      var total = lines.reduce(function (s, l) { return s + l[1]; }, 0);
      if (mods.indexOf('ewa') > -1) lines.push(['Výběr mzdy', 0, '0 Kč měsíčně']);
      var impl = mods.indexOf('ewa') > -1 ? [['Implementace výběru mzdy', '20 000 Kč <span class="ph">OVĚŘIT</span>'], ['Zavedení a školení', '<span class="ph">[DOPLNIT]</span>']] : [['Zavedení a školení', '<span class="ph">[DOPLNIT]</span>']];
      return {
        kicker: SIZE_K[st.vel] + ' · ' + z + (z === 1 ? ' závod' : z < 5 ? ' závody' : ' závodů'),
        name: 'Balíček ' + HR_PKG[pkg][0] + (mods.indexOf('ewa') > -1 ? ' + výběr mzdy' : ''),
        tag: 'Moduly podle toho, co řešíte',
        list: mods.map(function (k) { var m = HR_MOD[k]; return { ic: m[0], t: m[1], d: m[2], on: false }; }),
        lines: lines, total: total, od: false, impl: impl,
        foot: '<b>Ceny bez DPH za jeden závod.</b> Každý další závod 12\u00a0500\u00a0Kč měsíčně. Zapnete jen moduly, které potřebujete.',
        summary: 'HR · ' + SIZE_L[st.vel] + ' zaměstnanců · ' + z + ' záv. · balíček ' + HR_PKG[pkg][0] + (mods.indexOf('panel') > -1 ? ' + Panel služeb' : '') + (mods.indexOf('ewa') > -1 ? ' + výběr mzdy' : '')
      };
    },
    servis: function (st) {
      var b = SV_BAND[st.vel], n = Math.max(1, st.n | 0), need = st.need;
      var name = n <= 40 ? 'Servisní tým' : n <= 250 ? 'Servis napříč firmou' : n <= 2000 ? 'Rozsáhlé nasazení' : 'Individuální nabídka';
      var hl = { AI: need.indexOf('manualy') > -1 || need.indexOf('dotazy') > -1, DOC: need.indexOf('manualy') > -1, VID: need.indexOf('zauceni') > -1, INFO: need.indexOf('postupy') > -1 };
      return {
        kicker: SIZE_K[st.vel] + ' · ' + nf(n) + ' ' + (n === 1 ? 'uživatel' : n < 5 ? 'uživatelé' : 'uživatelů'),
        name: name, tag: 'Jedna cena pro všechny vaše závody',
        list: [
          { ic: 'AI', t: 'Hlasový a textový AI asistent', d: '', on: hl.AI },
          { ic: 'DOC', t: 'Manuály a firemní know-how', d: 'Schválené návody, postupy a odpovědi specialistů.', on: hl.DOC },
          { ic: 'VID', t: 'Videonávody a krátká školení', d: 'Názorná pomoc při práci i zaškolování nových kolegů.', on: hl.VID },
          { ic: 'INFO', t: 'Technické aktuality a rozcestník', d: 'Změny postupů, důležité kontakty a firemní odkazy.', on: hl.INFO }
        ],
        rate: b.rate, lines: need.indexOf('ewa') > -1 ? [['Výběr mzdy', 0, '0\u00a0Kč měsíčně']] : [], total: n * b.rate, od: b.od,
        impl: [['Zavedení jednorázově', kc(b.impl)]].concat(need.indexOf('ewa') > -1 ? [['Implementace výběru mzdy', '20\u00a0000\u00a0Kč <span class="ph">OVĚŘIT</span>']] : []),
        integ: need.indexOf('integrace') > -1,
        foot: '<b>Cena platí společně pro všechny závody a pobočky vaší firmy.</b> Za jednotlivé závody se paušál nenásobí. Standardní orientační ceny bez DPH, individuální zvýhodnění rádi probereme podle rozsahu spolupráce.',
        summary: 'Servis · firma ' + SIZE_L[st.vel] + ' zaměstnanců · ' + n + ' uživatelů · ' + name
      };
    },
    sit: function (st) {
      var n = Math.max(1, st.n | 0), p = sitMonthly(n), need = st.need;
      var hl = { AI: need.indexOf('produkty') > -1 || need.indexOf('centrala') > -1, INFO: need.indexOf('kampane') > -1, START: need.indexOf('novacci') > -1, HUB: need.indexOf('nastroje') > -1 };
      var lines = [['Základ: 25 uživatelů + 3 správci', p.base]];
      if (p.extUsers) lines.push(['Rozšiřující licence: ' + nf(p.extUsers) + ' uživatelů', p.ext]);
      return {
        kicker: 'Pro ' + nf(n) + ' uživatelů sítě + 3 správce obsahu',
        name: 'Zázemí pro celou síť', tag: 'Jedna licence pro centrálu i obchodní partnery',
        list: [
          { ic: 'AI', t: 'AI odpovědi k produktům a postupům', d: '', on: hl.AI },
          { ic: 'INFO', t: 'Kampaně a obchodní novinky', d: 'Krátká sdělení a Stories propojí centrálu s celou sítí.', on: hl.INFO },
          { ic: 'START', t: 'Rychlejší start prodejního týmu', d: 'Produktové znalosti a školení pro nové i zkušené členy.', on: hl.START },
          { ic: 'HUB', t: 'Nástroje a kontakty na jednom místě', d: 'Rozcestník partnerských portálů, vzdělávání a podpory.', on: hl.HUB }
        ],
        lines: lines, total: p.total, od: false,
        impl: [['Standardní zavedení jednorázově od', kc(9900)]],
        integ: need.indexOf('integrace') > -1,
        foot: '<b>Společná cena pro celou síť, prodejní místa a partnerské týmy.</b> Jejich počet cenu nenásobí. Standardní orientační ceny bez DPH, individuální zvýhodnění rádi probereme podle rozsahu spolupráce.',
        summary: 'Obchodní síť · ' + n + ' uživatelů'
      };
    }
  };

  /* ---------- vykreslení ---------- */
  var stepHtml = function (seg, i, s, st) {
    var chips = '<div class="opts" role="group" aria-label="' + esc(s.t) + '">' + s.opts.map(function (o) {
      var on = s.multi ? st[s.key].indexOf(o[0]) > -1 : st[s.key] === o[0];
      return '<button type="button" class="opt" data-k="' + s.key + '" data-v="' + o[0] + '"' + (s.multi ? ' data-multi' : '') + ' aria-pressed="' + on + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
    var num = '';
    if (s.num) {
      var inp = '<input id="pc-' + seg + '-' + s.num.key + '" type="number" inputmode="numeric" min="' + s.num.min + '" max="' + s.num.max + '" data-num="' + s.num.key + '" value="' + st[s.num.key] + '"' + (s.num.aria ? ' aria-label="' + esc(s.num.aria) + '"' : '') + '>';
      num = s.num.label ? '<div class="pc-num"><label for="pc-' + seg + '-' + s.num.key + '">' + esc(s.num.label) + '</label>' + inp + '</div>' : '<div class="pc-num pc-num--solo">' + inp + '</div>';
    }
    return '<div class="cfg-step"><h3><span class="n">' + (i + 1) + '</span>' + esc(s.t) + (s.multi ? '<span class="pc-sub">(vyberte vše, co platí)</span>' : '') + '</h3>' +
      (s.numFirst ? num + chips : chips + num) + '</div>';
  };

  var resHtml = function (seg, st) {
    var r = compute[seg](st), f = st.pay === 'y' ? ANNUAL : 1, od = r.od ? 'od ' : '';
    var pay = '<div class="pc-pay" role="group" aria-label="Způsob platby"><button type="button" data-pay="m" aria-pressed="' + (st.pay === 'm') + '">Měsíční platba</button><button type="button" data-pay="y" aria-pressed="' + (st.pay === 'y') + '">12 měsíců předem <em>−20 %</em></button></div>';
    var lines = r.lines.map(function (l) { return '<div><span>' + esc(l[0]) + '</span><b>' + (l[2] || kc(l[1] * f)) + '</b></div>'; }).join('');
    var tot = r.total * f, sub;
    if (seg === 'servis') {
      sub = f < 1 ? od + kc(r.rate * f, 2) + ' / uživatel. Roční úhrada předem ' + od + kc(tot * 12) + '.' : od + kc(r.rate) + ' / uživatel. Při roční platbě ' + od + kc(r.total * ANNUAL) + ' / měsíc.';
    } else if (r.total) {
      sub = f < 1 ? 'Roční úhrada předem ' + od + kc(tot * 12) + '. Standardně ' + od + kc(r.total) + ' měsíčně.' : 'Při roční platbě ' + od + kc(r.total * ANNUAL) + ' / měsíc. Roční úhrada předem ' + od + kc(r.total * ANNUAL * 12) + '.';
    } else { sub = 'Základní balíček je zdarma. Platíte jen moduly navíc.'; }
    var impl = r.impl.map(function (l) { return '<div class="pc-impl"><span>' + esc(l[0]) + '</span><b>' + l[1] + '</b></div>'; }).join('');
    var integ = r.integ ? '<p class="pc-integ">Napojení na vaše systémy vymezíme a naceníme zvlášť.</p>' : '';
    var href = 'kontakt.html?segment=' + CONTACT[seg] + '&zdroj=cenik&navrh=' + encodeURIComponent(r.summary + interests(seg, st) + ' · orientačně ' + od + kc(tot).replace(/ /g, ' ') + ' měsíčně' + (f < 1 ? ' při roční platbě' : ''));
    return pay +
      (lines ? '<div class="price-sum pc-lines">' + lines + '</div>' : '') +
      '<div class="pc-total"><span>' + (f < 1 ? 'Měsíčně při roční platbě' : 'Orientačně měsíčně') + '</span><b>' + od + kc(tot) + '</b></div><p class="pc-subt">' + sub + '</p>' +
      impl + integ + '<a class="btn btn--primary btn--lg" href="' + href + '">Domluvit demo s tímto návrhem</a><p class="pc-foot">' + r.foot + '</p>';
  };

  Array.prototype.forEach.call(roots, function (root) {
    var tabs = root.hasAttribute('data-tabs');
    var states = {};
    Object.keys(SEG).forEach(function (k) { states[k] = JSON.parse(JSON.stringify(SEG[k].def)); });
    var seg = root.getAttribute('data-pricecalc');
    if (tabs) {
      var p = new URLSearchParams(location.search).get('segment'), h = location.hash.replace('#', '');
      var fromQ = { pink: 'hr', blue: 'servis', white: 'sit' }[p] || (SEG[p] ? p : '');
      if (SEG[h]) seg = h; else if (fromQ) seg = fromQ;
    }
    var panels = document.querySelectorAll('[data-seg-panel]');
    var draw = function () {
      var st = states[seg], d = SEG[seg];
      var off = tabs ? 1 : 0;
      var oborHtml = tabs ? '<div class="cfg-step"><h3><span class="n">1</span>Obor</h3><div class="opts" role="group" aria-label="Obor">' + Object.keys(SEG).map(function (k) {
        return '<button type="button" class="opt" data-tab="' + k + '" aria-pressed="' + (k === seg) + '">' + SEG[k].tab + '</button>';
      }).join('') + '</div></div>' : '';
      root.innerHTML = '<div class="cfg pc"><div class="pc-steps">' + oborHtml + d.steps.map(function (s, i) { return stepHtml(seg, i + off, s, st); }).join('') +
        '</div><aside class="cfg-res pc-res" aria-live="polite">' + resHtml(seg, st) + '</aside></div>';
      Array.prototype.forEach.call(panels, function (pn) { pn.hidden = pn.getAttribute('data-seg-panel') !== seg; });
    };
    var redrawRes = function () { root.querySelector('.pc-res').innerHTML = resHtml(seg, states[seg]); };
    root.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t || !root.contains(t)) return;
      var st = states[seg];
      if (t.hasAttribute('data-tab')) { seg = t.getAttribute('data-tab'); draw(); if (history.replaceState) history.replaceState(null, '', '#' + seg); return; }
      if (t.hasAttribute('data-pay')) { st.pay = t.getAttribute('data-pay'); redrawRes(); return; }
      var k = t.getAttribute('data-k'); if (!k) return;
      var v = t.getAttribute('data-v');
      if (t.hasAttribute('data-multi')) {
        var i = st[k].indexOf(v); if (i > -1) st[k].splice(i, 1); else st[k].push(v);
        t.setAttribute('aria-pressed', String(i < 0));
      } else {
        st[k] = v;
        Array.prototype.forEach.call(t.parentNode.querySelectorAll('.opt'), function (x) { x.setAttribute('aria-pressed', String(x === t)); });
        if (k === 'presetN') st.n = +v;
        if (seg === 'servis') {
          if (k === 'presetN') st.vel = st.n <= 100 ? 's' : st.n <= 500 ? 'm' : st.n <= 2000 ? 'l' : 'xl';
          draw(); return;
        }
      }
      redrawRes();
    });
    root.addEventListener('input', function (e) {
      var t = e.target; if (!t.hasAttribute('data-num')) return;
      var st = states[seg], k = t.getAttribute('data-num'), v = parseInt(t.value, 10);
      if (!(v > 0)) return;
      v = Math.min(v, +t.max); st[k] = v;
      if (seg === 'sit') { st.presetN = String(v); Array.prototype.forEach.call(root.querySelectorAll('[data-k="presetN"]'), function (x) { x.setAttribute('aria-pressed', String(+x.getAttribute('data-v') === v)); }); }
      if (seg === 'servis' && k === 'n') {
        var band = v <= 100 ? 's' : v <= 500 ? 'm' : v <= 2000 ? 'l' : 'xl';
        var order = ['s', 'm', 'l', 'xl'];
        if (order.indexOf(band) > order.indexOf(st.vel)) { st.vel = band; Array.prototype.forEach.call(root.querySelectorAll('[data-k="vel"]'), function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === band)); }); }
      }
      redrawRes();
    });
    root.addEventListener('change', function (e) { var t = e.target; if (t.hasAttribute('data-num')) t.value = states[seg][t.getAttribute('data-num')]; });
    draw();
  });
})();

/* ---------- obchodní sítě: kalkulačka zátěže centrály ---------- */
(function () {
  var c = document.querySelector('[data-netcalc]'); if (!c) return;
  var kc = function (v) { return Math.round(v).toLocaleString('cs-CZ').replace(/\s/g, ' ') + ' Kč'; };
  var val = function (n) { return parseFloat(c.querySelector('[name="' + n + '"]').value) || 0; };
  var set = function (k, v) { var el = c.querySelector('[data-no="' + k + '"]'); if (el) el.textContent = v; };
  function upd() {
    c.querySelectorAll('input[type=range]').forEach(function (i) {
      i.style.setProperty('--fill', ((i.value - i.min) / (i.max - i.min) * 100) + '%');
      var o = c.querySelector('output[for="' + i.id + '"]');
      if (o) o.textContent = i.dataset.fmt === 'kc' ? kc(+i.value) : (+i.value).toLocaleString('cs-CZ') + (i.dataset.suf || '');
    });
    var q = val('lidi') * val('dotazy') * 4.33, hours = q * val('min') / 60, month = hours * val('rate');
    set('month', kc(month)); set('hours', Math.round(hours).toLocaleString('cs-CZ') + ' h');
    set('q', Math.round(q).toLocaleString('cs-CZ')); set('half', kc(month / 2)); set('year', kc(month * 12));
  }
  c.addEventListener('input', upd); upd();
})();

/* ---------- oborové stránky: sticky telefon se kroky ---------- */
(function () {
  var roots = document.querySelectorAll('[data-fstory]'); if (!roots.length) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(roots, function (root) {
    var steps = root.querySelectorAll('.fs-step'), screens = root.querySelectorAll('.fs-screen'), sats = root.querySelectorAll('.fs-sats'), rail = root.querySelector('.fs-rail'), links = root.querySelectorAll('.fs-rail a'), active = -1, ticking = false;
    var set = function (i) {
      if (i === active) return; active = i;
      [steps, sats, links].forEach(function (list) { Array.prototype.forEach.call(list, function (el, k) { el.classList.toggle('on', k === i); }); });
      Array.prototype.forEach.call(screens, function (el, k) { el.classList.toggle('on', k === i); el.classList.toggle('past', k < i); });
    };
    var upd = function () {
      var H = window.innerHeight, mid = H / 2, best = 0, r = root.getBoundingClientRect();
      Array.prototype.forEach.call(steps, function (s, k) { if (s.getBoundingClientRect().top < mid) best = k; });
      set(best);
      if (rail && !reduced) rail.style.setProperty('--p', Math.max(0, Math.min(1, -r.top / (r.height - H))).toFixed(4));
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(upd); ticking = true; } }, { passive: true });
    window.addEventListener('resize', upd);
    set(0); upd();
  });
})();
