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
    /* ukázka: jen přepínač hotových zpráv a skupin, bez vlastního textu a bez generování */
    var src = $('.demo-src', demo), current = 'smeny', timers = [];
    var type = function (el, text, delay) {
      timers.push(setTimeout(function () {
        if (reduced) { el.textContent = text; return; }
        var i = 0; el.innerHTML = '<span></span><span class="caret"></span>';
        var span = el.firstChild;
        var tick = function () { i += 3; span.textContent = text.slice(0, i); if (i < text.length) timers.push(setTimeout(tick, 14)); else el.lastChild.remove(); };
        tick();
      }, delay));
    };
    var render = function (animate) {
      timers.forEach(clearTimeout); timers = [];
      var data = DEMO[current];
      $$('.outcard', demo).filter(function (c) { return !c.hidden; }).forEach(function (c, k) {
        c.classList.add('live');
        if (animate) type($('.bubble', c), data.out[c.dataset.g], k * 260); else $('.bubble', c).textContent = data.out[c.dataset.g];
      });
    };
    var setPreset = function (k, animate) {
      current = k; src.textContent = DEMO[k].src;
      $$('.pchip', demo).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.preset === k)); });
      render(animate);
    };
    $$('.pchip', demo).forEach(function (b) { b.addEventListener('click', function () { setPreset(b.dataset.preset, true); }); });
    $$('.gchip', demo).forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        if (!on && $$('.gchip[aria-pressed="true"]', demo).length === 1) return;
        b.setAttribute('aria-pressed', String(on));
        var card = $('.outcard[data-g="' + b.dataset.g + '"]', demo); if (card) card.hidden = !on;
        if (on && card) { card.classList.add('live'); type($('.bubble', card), DEMO[current].out[b.dataset.g], 0); }
      });
    });
    setPreset('smeny', false);
  }

  /* ---------- kontakt: předvyplnění z kalkulačky / konfigurátoru ---------- */
  var form = $('[data-contact]');
  if (form) {
    var p = new URLSearchParams(location.search);
    var msg = [];
    var PK = { zaklad: 'Základ', asistent: 'Asistent', komplet: 'Komplet' };
    if (p.get('zdroj') === 'kalkulacka') msg.push('Spočítal(a) jsem si přínos v kalkulačce: ' + p.get('zamestnanci') + ' zaměstnanců, ' + p.get('zavody') + ' závod(y), balíček ' + (PK[p.get('balicek')] || '') + (p.get('panel') ? ' + Panel služeb' : '') + '.');
    var MN = { komunikace: 'interní komunikace', dokumenty: 'dokumenty', generator: 'Stories a Generátor', asistent: 'AI asistent', rozcestnik: 'rozcestník služeb' };
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
    var emp = p.get('zamestnanci'); if (emp) { var s = $('select[name="velikost"]', form); var n = +emp; s.value = n <= 50 ? '1-50' : n <= 200 ? '51-200' : n <= 500 ? '201-500' : n <= 1000 ? '501-1000' : n <= 2500 ? '1001-2500' : '2500+'; }
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
   CENÍK: kalkulačka pro servis a výrobu, obchodní sítě a HR
   Ceny bez DPH. Servis a sítě podle cenových příloh z 9. 11. 2026
   (obchodní sítě + servisní síť), HR podle předchozí verze webu.
   Roční platba: měsíční ekvivalent = P × 0,8 (−20 %).
   Zobrazené částky se zaokrouhlují na celé koruny.
   Pět funkcí je vždy v ceně (minimum), cenu nemění.
   Za příplatek: další jazyky (1 590 Kč za jazyk, jednorázově)
   a víc než 3 odkazy v rozcestníku (nacenění po konzultaci).
   ====================================================== */
(function () {
  'use strict';
  var roots = document.querySelectorAll('[data-pricecalc]');
  if (!roots.length) return;
  var LANG_EXTRA = 1590;
  /* jezdec: po 25 do 100, dál po 100 do 2 500; poslední poloha = 2 500+ */
  var VALS = [0, 25, 50, 75];
  for (var v = 100; v <= 2500; v += 100) VALS.push(v);
  VALS.push(2501);
  var MAXI = VALS.length - 1;
  /* všechny částky zaokrouhlené na celé koruny */
  var nf = function (n) { return Math.round(n).toLocaleString('cs-CZ', { maximumFractionDigits: 0 }).replace(/\s/g, '\u00a0'); };
  var kc = function (n) { return nf(n) + '\u00a0Kč'; };
  var nShow = function (n) { return n > 2500 ? '2 500+' : nf(n); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pl = function (n, one, few, many) { return n === 1 ? one : n > 1 && n < 5 ? few : many; };
  var flag = function (c, alt) { return '<img class="flag" src="assets/img/flags/' + c + '.svg" alt="' + (alt || '') + '" width="20" height="15">'; };
  var CHECK = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  var BASE_LANGS = [['cz', 'čeština'], ['sk', 'slovenština'], ['gb', 'angličtina'], ['de', 'němčina'], ['ua', 'ukrajinština']];
  var baseFlags = '<span class="flags">' + BASE_LANGS.map(function (l) { return flag(l[0], l[1]); }).join('') + '</span>';
  var INCLUDED = [
    ['AI asistent', 'textový i hlasový'],
    ['Generátor obsahu na míru', 'video, text a plánování příspěvků'],
    ['Firemní dokumenty', 'nahrajeme je do asistenta'],
    ['Rozcestník firemních služeb', '3 odkazy'],
    ['Jazyky', baseFlags]
  ];
  var EXTRA_LANGS = [['pl', 'Polština'], ['hu', 'Maďarština'], ['ro', 'Rumunština'], ['bg', 'Bulharština'], ['vn', 'Vietnamština'], ['mn', 'Mongolština'], ['ph', 'Filipínština'], ['fr', 'Francouzština'], ['it', 'Italština']];

  /* ---------- ceny ---------- */
  var servisMonthly = function (e) {
    if (e < 25 || e > 1000) return null;
    return e <= 100 ? 80 * e + 2750 : e <= 500 ? 65 * e + 4250 : 45 * e + 14250;
  };
  var sitMonthly = function (u) {
    if (u < 1 || u > 1000) return null;
    if (u <= 25) return 3625;
    if (u <= 40) return 3625 + (u - 25) * 1300 / 15;
    if (u <= 300) return 4925 + (u - 40) * 17200 / 260;
    return 22125 + (u - 300) * 24000 / 700;
  };
  var HR_KOMPLET = 6250; /* všech 5 funkcí v ceně = balíček Komplet */
  var BIG_HR = 'Pro firmy nad 2 500 zaměstnanců připravíme individuální nabídku.';
  var BIG = 'Pro víc než 2 500 lidí připravíme individuální nabídku.';
  /* servis a sítě: aplikaci nedostanou jen zaměstnanci, proto obecně „lidé“ */
  var LIDE = function (n) { return pl(n, 'člověk', 'lidé', 'lidí'); };
  var ZAM = function (n) { return pl(n, 'zaměstnanec', 'zaměstnanci', 'zaměstnanců'); };

  var SEG = {
    servis: {
      tab: 'Servis a výroba', contact: 'blue', impl: '45 000–60 000 Kč',
      calc: function (n) {
        if (n > 2500) return { indiv: BIG };
        var p = servisMonthly(n);
        if (p === null) return { indiv: n < 25 ? 'Pro méně než 25 lidí připravíme individuální nabídku.' : 'Pro víc než 1 000 lidí připravíme individuální nabídku.' };
        return { p: p };
      }
    },
    sit: {
      tab: 'Obchodní sítě', contact: 'white', impl: '30 000–50 000 Kč',
      calc: function (n) {
        if (n > 2500) return { indiv: BIG };
        var p = sitMonthly(n);
        if (p === null) return { indiv: 'Pro víc než 1 000 lidí připravíme individuální nabídku.' };
        return { p: p, note: '+ 3 správci obsahu v ceně' };
      }
    },
    hr: {
      tab: 'HR a zaměstnanci', contact: 'pink', impl: null, people: false,
      calc: function (n) {
        if (n > 2500) return { indiv: BIG_HR };
        return { p: HR_KOMPLET };
      }
    }
  };
  var ORDER = ['servis', 'sit', 'hr'];
  var DEF = { n: 200, langs: [], links: false };

  var idxOf = function (n) { for (var i = 0; i < VALS.length; i++) if (VALS[i] >= n) return i; return MAXI; };
  var TICKS = [0, 500, 1000, 1500, 2000, 2501];

  /* ---------- vykreslení ---------- */
  var stepH = function (i, t, sub) { return '<h3><span class="n">' + i + '</span>' + esc(t) + (sub ? '<span class="pc-sub">' + esc(sub) + '</span>' : '') + '</h3>'; };
  var tip = function (id) {
    return '<span class="tip"><button type="button" class="tip-btn" aria-label="Jak naceňujeme implementaci" aria-describedby="' + id + '">?</button>' +
      '<span class="tip-txt" role="tooltip" id="' + id + '">Přesné nacenění je možné po konzultaci specifických požadavků.</span></span>';
  };

  var rangeHtml = function (seg, i, st) {
    var ix = idxOf(st.n), pct = ix / MAXI * 100;
    var ppl = SEG[seg].people !== false, unit = ppl ? LIDE : ZAM;
    return '<div class="cfg-step">' + stepH(i, ppl ? 'Pro kolik lidí aplikaci zpřístupníte' : 'Kolik máte zaměstnanců') +
      '<div class="pc-range"><div class="pc-range-v"><output data-nout>' + nShow(st.n) + '</output><span data-nlab>' + unit(st.n) + '</span></div>' +
      '<input type="range" min="0" max="' + MAXI + '" step="1" value="' + ix + '" data-range aria-label="' + (ppl ? 'Počet lidí s přístupem' : 'Počet zaměstnanců') + '" aria-valuetext="' + nShow(st.n) + ' ' + unit(st.n) + '" style="--fill:' + pct + '%">' +
      '<div class="pc-ticks" aria-hidden="true">' + TICKS.map(function (t) { return '<span style="left:' + (idxOf(t) / MAXI * 100) + '%">' + nShow(t) + '</span>'; }).join('') + '</div></div></div>';
  };

  var inclHtml = function (i) {
    return '<div class="cfg-step">' + stepH(i, 'Co je vždy v ceně', 'cenu nemění') +
      '<ul class="pc-incl">' + INCLUDED.map(function (o) {
        return '<li>' + CHECK + '<div><b>' + esc(o[0]) + '</b><small>' + o[1] + '</small></div></li>';
      }).join('') + '</ul></div>';
  };

  var extraHtml = function (i, st) {
    return '<div class="cfg-step">' + stepH(i, 'Za příplatek') +
      '<div class="pc-xh"><b>Další jazyky</b><span>' + kc(LANG_EXTRA) + ' za jazyk, jednorázově</span></div>' +
      '<div class="opts opts--lang" role="group" aria-label="Další jazyky">' + EXTRA_LANGS.map(function (l) {
        return '<button type="button" class="opt opt--lang" data-lang="' + l[0] + '" aria-pressed="' + (st.langs.indexOf(l[0]) > -1) + '">' + flag(l[0]) + esc(l[1]) + '</button>';
      }).join('') + '</div>' +
      '<p class="pc-hint">Další světové jazyky připravíme na vyžádání.</p>' +
      '<div class="pc-xh pc-xh--sep"><b>Rozcestník firemních služeb</b><span>3 odkazy v ceně</span></div>' +
      '<div class="opts"><button type="button" class="opt" data-links aria-pressed="' + st.links + '">Chci víc než 3 odkazy</button></div></div>';
  };

  var interests = function (st) {
    var parts = [];
    if (st.langs.length) parts.push('další jazyky: ' + EXTRA_LANGS.filter(function (l) { return st.langs.indexOf(l[0]) > -1; }).map(function (l) { return l[1].toLowerCase(); }).join(', '));
    if (st.links) parts.push('víc než 3 odkazy v rozcestníku');
    return parts.length ? ' · ' + parts.join(' · ') : '';
  };

  var resHtml = function (seg, st, uid) {
    var d = SEG[seg], n = st.n | 0, base = 'kontakt.html?segment=' + d.contact + '&zdroj=cenik&zamestnanci=' + n;
    if (n < 1) return '<div class="pc-empty"><b>Posuňte jezdec</b><p>Nastavte počet lidí a hned uvidíte cenu.</p></div>';
    var r = d.calc(n), who = nShow(n) + ' ' + (d.people !== false ? LIDE(n) : ZAM(n));
    if (r.indiv) {
      return '<div class="pc-indiv"><span class="pc-col-k">' + esc(d.tab) + ' · ' + who + '</span><b>Individuální nabídka</b><p>' + esc(r.indiv) + '</p></div>' +
        '<a class="btn btn--primary btn--lg" href="' + base + '&navrh=' + encodeURIComponent(d.tab + ' · ' + who + interests(st) + ' · individuální nabídka') + '">Ozvěte se nám</a>';
    }
    var m = Math.round(r.p), y = Math.round(r.p * 0.8), nl = st.langs.length;
    var cols = '<div class="pc-cols">' +
      '<div class="pc-col"><span class="pc-col-k">Měsíčně</span><b>' + kc(m) + '</b></div>' +
      '<div class="pc-col pc-col--y"><span class="pc-col-k">Měsíčně při roční platbě</span><b>' + kc(y) + '</b><span class="pc-disc">−20 %</span></div></div>';
    var rows = '';
    if (d.impl) rows += '<div class="pc-impl"><span>Implementace firemního řešení' + tip('tip-' + uid) + '</span><b>' + d.impl + '</b></div>';
    rows += '<div class="pc-impl"><span>Školení a zavedení</span><b class="pc-free">Zdarma</b></div>';
    rows += '<div class="pc-impl"><span>Jazyky v ceně</span><b>' + baseFlags + '</b></div>';
    if (nl) rows += '<div class="pc-impl"><span>Další jazyky<small>' + nl + ' × ' + kc(LANG_EXTRA) + ', jednorázově</small></span><b>' + kc(nl * LANG_EXTRA) + '</b></div>';
    if (st.links) rows += '<div class="pc-impl"><span>Další odkazy v rozcestníku</span><b>Za příplatek</b></div>';
    var summary = d.tab + ' · ' + who + interests(st) + ' · orientačně ' + kc(m).replace(/ /g, ' ') + ' měsíčně, při roční platbě ' + kc(y).replace(/ /g, ' ') + ' měsíčně';
    return cols + rows +
      '<a class="btn btn--primary btn--lg" href="' + base + '&navrh=' + encodeURIComponent(summary) + '">Domluvit demo s tímto návrhem</a>' +
      '<p class="pc-foot">Orientační ceny bez DPH.</p>';
  };

  Array.prototype.forEach.call(roots, function (root, rix) {
    var tabs = root.hasAttribute('data-tabs'), uid = 'pc' + rix;
    var st = JSON.parse(JSON.stringify(DEF));
    var seg = root.getAttribute('data-pricecalc');
    if (tabs) {
      var p = new URLSearchParams(location.search).get('segment'), h = location.hash.replace('#', '');
      var fromQ = { pink: 'hr', blue: 'servis', white: 'sit' }[p] || (SEG[p] ? p : '');
      if (SEG[h]) seg = h; else if (fromQ) seg = fromQ;
    }
    var panels = document.querySelectorAll('[data-seg-panel]');
    var draw = function () {
      var off = tabs ? 1 : 0;
      var oborHtml = tabs ? '<div class="cfg-step">' + stepH(1, 'Řešení') + '<div class="opts" role="group" aria-label="Řešení">' + ORDER.map(function (k) {
        return '<button type="button" class="opt" data-tab="' + k + '" aria-pressed="' + (k === seg) + '">' + SEG[k].tab + '</button>';
      }).join('') + '</div></div>' : '';
      root.innerHTML = '<div class="cfg pc"><div class="pc-steps">' + oborHtml + rangeHtml(seg, 1 + off, st) + inclHtml(2 + off) + extraHtml(3 + off, st) +
        '</div><aside class="cfg-res pc-res" aria-live="polite">' + resHtml(seg, st, uid) + '</aside></div>';
      Array.prototype.forEach.call(panels, function (pn) { pn.hidden = pn.getAttribute('data-seg-panel') !== seg; });
    };
    var redrawRes = function () { root.querySelector('.pc-res').innerHTML = resHtml(seg, st, uid); };
    root.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t || !root.contains(t) || t.classList.contains('tip-btn')) return;
      if (t.hasAttribute('data-tab')) { seg = t.getAttribute('data-tab'); draw(); if (history.replaceState) history.replaceState(null, '', '#' + seg); return; }
      if (t.hasAttribute('data-lang')) {
        var c = t.getAttribute('data-lang'), i = st.langs.indexOf(c);
        if (i > -1) st.langs.splice(i, 1); else st.langs.push(c);
        t.setAttribute('aria-pressed', String(i < 0)); redrawRes(); return;
      }
      if (t.hasAttribute('data-links')) { st.links = !st.links; t.setAttribute('aria-pressed', String(st.links)); redrawRes(); }
    });
    root.addEventListener('input', function (e) {
      var t = e.target; if (!t.hasAttribute('data-range')) return;
      var n = VALS[+t.value]; st.n = n;
      t.style.setProperty('--fill', (t.value / MAXI * 100) + '%');
      var unit = SEG[seg].people !== false ? LIDE : ZAM;
      t.setAttribute('aria-valuetext', nShow(n) + ' ' + unit(n));
      root.querySelector('[data-nout]').textContent = nShow(n);
      root.querySelector('[data-nlab]').textContent = unit(n);
      redrawRes();
    });
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
