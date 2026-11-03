/* PalmApp – firemní web: navigace, animace, demo, kalkulačka, konfigurátor */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return Math.round(n).toLocaleString('cs-CZ').replace(/ /g, ' '); };

  /* ---------- ceník (Kč bez DPH / měsíc) ---------- */
  var EUR = 25;
  var PRICE = {
    zaklad: { name: 'Základ', monthly: 0 },
    asistent: { name: 'Asistent', monthly: 99 * EUR },
    komplet: { name: 'Komplet', monthly: 250 * EUR },
    panel: 260 * EUR,
    zavod: 500 * EUR,
    ewaFee: 79
  };

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
        novi: 'Vítejte! Ranní směna začíná od 1. 11. v 6:00. Rozpis najdete v aplikaci v sekci Dokumenty.'
      }
    },
    akce: {
      src: 'V pátek 14. listopadu pořádáme firemní den v areálu závodu od 14:00. Bude program pro rodiny a občerstvení. Výroba má ten den zkrácenou odpolední směnu do 13:30. Účast prosím potvrďte do 7. listopadu.',
      out: {
        vyroba: '14. 11. končí odpolední směna už ve 13:30 a od 14:00 začíná firemní den v areálu. Účast potvrďte v aplikaci do 7. 11.',
        kancelar: 'Firemní den 14. 11. od 14:00 v areálu závodu, s programem pro rodiny a občerstvením. Potvrďte účast do 7. 11.',
        vedouci: '14. 11. je zkrácená odpolední směna do 13:30. Zkontrolujte obsazení a připomeňte týmu potvrzení účasti do 7. 11.',
        novi: 'Skvělá příležitost poznat kolegy: firemní den 14. 11. od 14:00. Stačí potvrdit účast v aplikaci do 7. 11.'
      }
    },
    bozp: {
      src: 'Od pondělí je ve skladu povinné nosit reflexní vestu po celou dobu směny, včetně přestávek ve venkovním areálu. Vesty jsou k vyzvednutí u vedoucího směny. Školení proběhne online v aplikaci.',
      out: {
        vyroba: 'Od pondělí: reflexní vesta po celou směnu, i o přestávkách venku. Vyzvednete si ji u vedoucího směny. Krátké školení najdete v aplikaci.',
        kancelar: 'Když jdete do skladu nebo venkovního areálu, vezměte si reflexní vestu. Od pondělí je povinná.',
        vedouci: 'Od pondělí vydávejte reflexní vesty a kontrolujte jejich nošení po celou směnu. Školení týmu proběhne v aplikaci.',
        novi: 'Bezpečnost na prvním místě: ve skladu vždy noste reflexní vestu. Vyzvednete si ji u vedoucího směny.'
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

  /* ======================================================
     KALKULAČKA PŘÍNOSŮ
     ====================================================== */
  $$('[data-calc]').forEach(function (calc) {
    var g = function (n) { var el = $('[name="' + n + '"]', calc); return el ? parseFloat(el.value) || 0 : null; };
    var pkg = calc.getAttribute('data-pkg') || 'komplet';
    $$('[data-pkg-btn]', calc).forEach(function (b) {
      b.addEventListener('click', function () {
        pkg = b.getAttribute('data-pkg-btn');
        $$('[data-pkg-btn]', calc).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        run();
      });
    });
    var out = function (k, v) { $$('[data-o="' + k + '"]', calc).forEach(function (el) { el.textContent = v; }); };
    var run = function () {
      var N = g('n'), Z = g('zavody') || 1, W = g('mzda') || 42000, panel = $('[name="panel"]', calc);
      var q = g('q') != null ? g('q') : 1, m = g('m') != null ? g('m') : 10, a = (g('a') != null ? g('a') : 50) / 100;
      var h = g('h') != null ? g('h') : 400, comm = g('comm') != null ? g('comm') : 3;
      var f = (g('f') != null ? g('f') : 20) / 100, c = (g('c') != null ? g('c') : 20) / 100, d = (g('d') != null ? g('d') : 1) / 100;
      $$('output[data-for]', calc).forEach(function (o) { var v = g(o.getAttribute('data-for')); o.textContent = fmt(v) + (o.getAttribute('data-unit') || ''); });
      var hrHours = N * q * m / 60 * a;
      var commHours = Z * comm * 4.33 * 0.5;
      var hours = hrHours + commHours;
      var timeKc = hours * h;
      var turnSave = N * d * (W * 12 * c);
      var price = (PRICE[pkg] ? PRICE[pkg].monthly : 0) + (panel && panel.checked ? PRICE.panel : 0) + Math.max(0, Z - 1) * PRICE.zavod;
      var net = timeKc + turnSave / 12 - price;
      out('hours', fmt(hours));
      out('hrHours', fmt(hrHours) + ' h');
      out('commHours', fmt(commHours) + ' h');
      out('timeKc', fmt(timeKc) + ' Kč');
      out('turn', fmt(turnSave) + ' Kč / rok');
      out('price', price ? '− ' + fmt(price) + ' Kč' : '0 Kč');
      out('net', fmt(net));
      out('netYear', fmt(net * 12) + ' Kč');
      out('ewa', fmt(N));
      out('pkgName', PRICE[pkg] ? PRICE[pkg].name : '');
      var link = $('[data-calc-link]', calc);
      if (link) link.href = 'kontakt.html?zdroj=kalkulacka&zamestnanci=' + N + '&zavody=' + Z + '&balicek=' + pkg + (panel && panel.checked ? '&panel=1' : '');
    };
    $$('input', calc).forEach(function (i) { i.addEventListener('input', run); i.addEventListener('change', run); });
    run();
  });

  /* ======================================================
     KONFIGURÁTOR ŘEŠENÍ
     ====================================================== */
  var cfg = $('[data-cfg]');
  if (cfg) {
    var state = { obor: 'vyroba', vel: 'm', need: ['email', 'hr'] };
    var MOD = {
      komunikace: { t: 'Interní komunikace a novinky', d: 'Zprávy, oznámení a upozornění přímo do telefonu, i lidem bez firemního e-mailu.', ic: 'bell' },
      generator: { t: 'Stories, Generátor a Režisér', d: 'Z jedné zprávy připraví verze pro jednotlivé skupiny. Vy je před odesláním zkontrolujete.', ic: 'spark' },
      asistent: { t: 'AI asistent (Chatbot + Voicebot)', d: 'Odpovídá na opakované dotazy podle vašich směrnic a manuálů, i hlasem.', ic: 'chat' },
      panel: { t: 'Panel služeb (Panel3)', d: 'Rozcestník na jídelnu, parkování, personální systém nebo další firemní odkazy.', ic: 'grid' },
      ewa: { t: 'Výběr mzdy jako benefit', d: 'Zaměstnanci si vyberou část odpracované mzdy. Firma po implementaci neplatí nic měsíčně.', ic: 'wallet' },
      dokumenty: { t: 'Dokumenty', d: 'Výplatní pásky, smlouvy a směrnice v mobilu, bez tisku a rozdávání.', ic: 'doc' }
    };
    var ICON = {
      bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
      spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
      chat: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 1 1 16.1-3.8z"/>',
      grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      wallet: '<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="2.5"/>',
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'
    };
    var SIZE = { s: 'do 100', m: '100–500', l: '500–2 000', xl: '2 000+' };
    var render = function () {
      var mods = ['komunikace', 'dokumenty'];
      var need = state.need;
      var gen = need.indexOf('email') > -1 || need.indexOf('smeny') > -1 || state.obor === 'vyroba' && need.indexOf('smeny') > -1;
      var asis = need.indexOf('hr') > -1;
      if (gen) mods.push('generator');
      if (asis || gen) mods.push('asistent');
      if (need.indexOf('odkazy') > -1) mods.push('panel');
      if (need.indexOf('benefit') > -1 || need.indexOf('fluktuace') > -1) mods.push('ewa');
      var pkg = gen ? 'komplet' : asis ? 'asistent' : 'zaklad';
      var monthly = PRICE[pkg].monthly + (mods.indexOf('panel') > -1 ? PRICE.panel : 0);
      $('[data-o="cfgPkg"]', cfg).textContent = 'Balíček ' + PRICE[pkg].name + (mods.indexOf('ewa') > -1 ? ' + výběr mzdy' : '');
      $('[data-o="cfgSize"]', cfg).textContent = SIZE[state.vel] + ' zaměstnanců';
      $('.mods', cfg).innerHTML = mods.map(function (k) {
        var m = MOD[k];
        return '<li><span class="ic"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + ICON[m.ic] + '</svg></span><div><b>' + m.t + '</b><span>' + m.d + '</span></div></li>';
      }).join('');
      $('[data-o="cfgPkgPrice"]', cfg).textContent = PRICE[pkg].monthly ? fmt(PRICE[pkg].monthly) + ' Kč' : '0 Kč';
      var pr = $('[data-o="cfgPanel"]', cfg); pr.parentNode.hidden = mods.indexOf('panel') < 0; pr.textContent = fmt(PRICE.panel) + ' Kč';
      var ew = $('[data-o="cfgEwa"]', cfg); ew.parentNode.hidden = mods.indexOf('ewa') < 0;
      $('[data-o="cfgTotal"]', cfg).textContent = fmt(monthly) + ' Kč';
      $('[data-cfg-link]', cfg).href = 'kontakt.html?segment=pink&zdroj=konfigurator&obor=' + state.obor + '&velikost=' + state.vel + '&balicek=' + pkg + '&moduly=' + mods.join(',');
    };
    $$('[data-group]', cfg).forEach(function (grp) {
      var key = grp.getAttribute('data-group'), multi = grp.hasAttribute('data-multi');
      $$('.opt', grp).forEach(function (b) {
        var v = b.getAttribute('data-v');
        var sel = multi ? state[key].indexOf(v) > -1 : state[key] === v;
        b.setAttribute('aria-pressed', String(sel));
        b.addEventListener('click', function () {
          if (multi) {
            var i = state[key].indexOf(v);
            if (i > -1) state[key].splice(i, 1); else state[key].push(v);
            b.setAttribute('aria-pressed', String(i < 0));
          } else {
            state[key] = v; $$('.opt', grp).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          }
          render();
        });
      });
    });
    render();
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
