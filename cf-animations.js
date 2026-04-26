/**
 * Clara Futura — Scroll Animations for WordPress Content Pages
 * Hosted on GitHub Pages, loaded via <script src=""> in WordPress wp:html blocks.
 * WordPress.com strips inline <script> but allows external script sources.
 */
(function() {
  'use strict';
  
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('cf-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function initAnimations() {
    var page = document.querySelector('.entry-content') || document.querySelector('.wp-site-blocks') || document.body;
    if (!page) return;

    // 1) Section-level groups: fade-up reveal on child elements
    var groups = page.querySelectorAll('.wp-block-group.alignfull');
    groups.forEach(function(group) {
      if (group.closest('.wp-block-cover')) return;
      var inner = group.querySelector(':scope > .wp-block-group');
      if (!inner) inner = group;
      var children = inner.querySelectorAll(':scope > h2, :scope > h3, :scope > p, :scope > .wp-block-columns, :scope > .wp-block-quote, :scope > .wp-block-buttons, :scope > .wp-block-separator, :scope > .wp-block-group, :scope > figure');
      var delay = 0;
      children.forEach(function(child) {
        if (child.classList.contains('cf-reveal') || child.classList.contains('cf-reveal-left') || child.classList.contains('cf-reveal-scale')) return;
        child.classList.add('cf-reveal');
        if (delay < 6) child.classList.add('cf-delay-' + (delay + 1));
        delay++;
        observer.observe(child);
      });
    });

    // 2) Blockquotes: slide from left
    page.querySelectorAll('.wp-block-quote').forEach(function(quote, i) {
      if (quote.classList.contains('cf-reveal-left')) return;
      quote.classList.add('cf-reveal-left');
      quote.classList.add('cf-delay-' + ((i % 4) + 1));
      observer.observe(quote);
    });

    // 3) Column cards: scale-up with stagger + hover
    page.querySelectorAll('.wp-block-columns').forEach(function(cols) {
      cols.querySelectorAll('.wp-block-column').forEach(function(card, j) {
        var inner = card.querySelector('.wp-block-group');
        if (inner && !inner.classList.contains('cf-reveal-scale')) {
          inner.classList.add('cf-reveal-scale', 'cf-card-hover', 'cf-delay-' + Math.min(j + 1, 4));
          observer.observe(inner);
        }
      });
    });

    // 4) Separators: line draw
    page.querySelectorAll('.wp-block-separator').forEach(function(sep) {
      observer.observe(sep);
    });

    // 5) Timeline items (groups with left border)
    page.querySelectorAll('[style*="border-left-color"]').forEach(function(item, i) {
      if (item.classList.contains('cf-reveal')) return;
      item.classList.add('cf-reveal', 'cf-delay-' + Math.min(i + 1, 3));
      observer.observe(item);
    });

    // 6) Hero parallax
    var cover = page.querySelector('.wp-block-cover');
    if (cover) {
      var bgImg = cover.querySelector('.wp-block-cover__image-background');
      if (bgImg) {
        bgImg.style.transform = 'scale(1.05)';
        window.addEventListener('scroll', function() {
          var rect = cover.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            bgImg.style.transform = 'translateY(' + (-rect.top * 0.15) + 'px) scale(1.05)';
          }
        }, { passive: true });
      }
    }

    // 7) Hero text cascade on load
    if (cover) {
      var heroInner = cover.querySelector('.wp-block-cover__inner-container');
      if (heroInner) {
        heroInner.querySelectorAll('p, h1, h2, figure').forEach(function(el, i) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(24px)';
          el.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1) ' + (0.2 + i * 0.15) + 's, transform 0.7s cubic-bezier(0.16,1,0.3,1) ' + (0.2 + i * 0.15) + 's';
          setTimeout(function() { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 100);
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }
})();

/**
 * Clara Futura — Ambient Music Player
 * Dynamically injects a floating play/pause button + HTML5 audio.
 * Hosted MP3 on same GitHub Pages origin. No login required.
 */
(function() {
  'use strict';

  // Audio source — hosted on GitHub Pages alongside this script
  var AUDIO_SRC = 'https://richarddobson1-cell.github.io/cf-scroll-animations/ambient-music.mp3';
  var TARGET_VOLUME = 0.35;
  var FADE_MS = 2000;
  var FADE_STEPS = 40;

  // Create audio element
  // preload='none' so Chromium does NOT auto-fetch the MP3 on every page load.
  // The full file is fetched only after the user clicks Play (see fadeIn()).
  var audio = document.createElement('audio');
  audio.preload = 'none';
  audio.loop = true;
  audio.src = AUDIO_SRC;

  // Create button
  var btn = document.createElement('button');
  btn.className = 'cf-ambient-btn';
  btn.setAttribute('aria-label', 'Play ambient music');
  btn.setAttribute('title', 'Play ambient music');
  btn.innerHTML = '<svg class="cf-amb-play" viewBox="0 0 24 24" fill="none"><polygon points="6,3 20,12 6,21" fill="#F2B54D"/></svg>' +
    '<svg class="cf-amb-pause" viewBox="0 0 24 24" fill="none" style="display:none"><rect x="5" y="3" width="4" height="18" rx="1" fill="#F2B54D"/><rect x="15" y="3" width="4" height="18" rx="1" fill="#F2B54D"/></svg>' +
    '<span class="cf-amb-ring"></span><span class="cf-amb-ring cf-amb-ring-2"></span>';

  // Inject CSS
  var css = document.createElement('style');
  css.textContent = [
    '.cf-ambient-btn{position:fixed;bottom:22px;right:22px;z-index:100000;width:44px;height:44px;border-radius:50%;',
    'border:1.5px solid rgba(242,181,77,0.5);background:rgba(12,33,55,0.85);backdrop-filter:blur(12px);',
    '-webkit-backdrop-filter:blur(12px);cursor:pointer;display:flex;align-items:center;justify-content:center;',
    'padding:0;transition:border-color .3s,background .3s,transform .2s;outline:none;}',
    '.cf-ambient-btn:hover{border-color:#F2B54D;background:rgba(242,181,77,0.15);transform:scale(1.08);}',
    '.cf-ambient-btn:active{transform:scale(0.95);}',
    '.cf-ambient-btn svg{width:18px;height:18px;}',
    '.cf-amb-play{margin-left:2px;}',
    '.cf-amb-ring{position:absolute;top:50%;left:50%;width:100%;height:100%;border-radius:50%;',
    'border:1px solid rgba(242,181,77,0.4);transform:translate(-50%,-50%) scale(1);',
    'animation:cfAmbPulse 2.5s ease-out infinite;pointer-events:none;}',
    '.cf-amb-ring-2{animation-delay:1.25s;}',
    '.cf-ambient-btn.is-playing .cf-amb-ring{border-color:rgba(242,181,77,0.6);}',
    '@keyframes cfAmbPulse{0%{transform:translate(-50%,-50%) scale(1);opacity:.7}100%{transform:translate(-50%,-50%) scale(2.2);opacity:0}}',
    /* Clear WP admin bar when present (logged-in users) */
    '@media(max-width:600px){.cf-ambient-btn{bottom:14px;right:14px;width:38px;height:38px;}.cf-ambient-btn svg{width:14px;height:14px;}}',
    /* === Make top navigation sticky on ALL pages (WP theme header + cf-header) === */
    'body > .wp-site-blocks > header,body > .wp-site-blocks > .wp-block-template-part:first-child,.wp-site-blocks > header.wp-block-template-part{position:sticky !important;top:0;z-index:9999;background:rgba(12,33,55,0.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(242,181,77,0.15);transition:background .3s}',
    '.cf-header{position:sticky !important;top:0;z-index:9999;background:rgba(12,33,55,0.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}',
    'body.admin-bar > .wp-site-blocks > header,body.admin-bar > .wp-site-blocks > .wp-block-template-part:first-child,body.admin-bar .cf-header{top:32px}',
    '@media(max-width:782px){body.admin-bar > .wp-site-blocks > header,body.admin-bar > .wp-site-blocks > .wp-block-template-part:first-child,body.admin-bar .cf-header{top:46px}}'
  ].join('');
  document.head.appendChild(css);

  // State
  var isPlaying = false;
  var fadeInt = null;
  var playIcon = btn.querySelector('.cf-amb-play');
  var pauseIcon = btn.querySelector('.cf-amb-pause');

  function updateUI() {
    playIcon.style.display = isPlaying ? 'none' : 'block';
    pauseIcon.style.display = isPlaying ? 'block' : 'none';
    btn.classList.toggle('is-playing', isPlaying);
    btn.setAttribute('aria-label', isPlaying ? 'Pause ambient music' : 'Play ambient music');
    btn.setAttribute('title', isPlaying ? 'Pause ambient music' : 'Play ambient music');
  }

  function clearFade() { if (fadeInt) { clearInterval(fadeInt); fadeInt = null; } }

  function fadeIn() {
    clearFade();
    audio.volume = 0;
    // Lazy-promote preload so the browser fetches the file on first play only
    if (audio.preload !== 'auto') { audio.preload = 'auto'; }
    audio.play().then(function() {
      isPlaying = true;
      updateUI();
      var step = 0;
      var stepTime = FADE_MS / FADE_STEPS;
      fadeInt = setInterval(function() {
        step++;
        var p = step / FADE_STEPS;
        audio.volume = TARGET_VOLUME * (p * p);
        if (step >= FADE_STEPS) { audio.volume = TARGET_VOLUME; clearFade(); }
      }, stepTime);
    }).catch(function() {});
  }

  function fadeOut() {
    clearFade();
    var startVol = audio.volume;
    var step = 0;
    var stepTime = FADE_MS / FADE_STEPS;
    fadeInt = setInterval(function() {
      step++;
      audio.volume = Math.max(0, startVol * (1 - step / FADE_STEPS));
      if (step >= FADE_STEPS) { audio.pause(); audio.volume = 0; isPlaying = false; updateUI(); clearFade(); }
    }, stepTime);
  }

  btn.addEventListener('click', function() { isPlaying ? fadeOut() : fadeIn(); });
  btn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); isPlaying ? fadeOut() : fadeIn(); }
  });
  audio.addEventListener('ended', function() { if (isPlaying) { audio.currentTime = 0; audio.play(); } });

  // Inject into page
  function injectPlayer() {
    document.body.appendChild(audio);
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPlayer);
  } else {
    injectPlayer();
  }
})();

/* ============================================================
   === Clara Futura — Preloader + Custom Amber Cursor (WP)
   ============================================================ */
(function() {
  'use strict';

  // Detect iframe — skip both features inside iframes (WP uses none here, but safe)
  var inIframe = false;
  try { inIframe = window.self !== window.top; } catch (e) { inIframe = true; }
  if (inIframe) return;

  // ---------- Inject CSS once ----------
  var CSS_ID = 'cf-premium-polish-css';
  if (!document.getElementById(CSS_ID)) {
    var style = document.createElement('style');
    style.id = CSS_ID;
    style.textContent = [
      /* Preloader */
      '.cf-wp-preloader{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.5rem;background:radial-gradient(ellipse at center,#122C45 0%,#0C2137 60%,#081827 100%);opacity:1;visibility:visible;transition:opacity .9s cubic-bezier(.16,1,.3,1),visibility .9s;pointer-events:auto}',
      '.cf-wp-preloader.is-hidden{opacity:0;visibility:hidden;pointer-events:none}',
      '.cf-wp-preloader svg{width:180px;height:180px;filter:drop-shadow(0 0 18px rgba(242,181,77,.35))}',
      '.cf-wp-pre-arc{animation:cfWpArc 2.4s cubic-bezier(.5,0,.15,1) infinite;transform-origin:100px 100px}',
      '@keyframes cfWpArc{0%{stroke-dashoffset:502;transform:rotate(-90deg)}50%{stroke-dashoffset:0;transform:rotate(90deg)}100%{stroke-dashoffset:-502;transform:rotate(270deg)}}',
      '.cf-wp-pre-pulse{transform-origin:100px 100px;animation:cfWpPulse 2.4s ease-in-out infinite}',
      '@keyframes cfWpPulse{0%,100%{opacity:.2;transform:scale(.96)}50%{opacity:.8;transform:scale(1.06)}}',
      '.cf-wp-pre-label{font-family:Inter,sans-serif;font-size:.7rem;font-weight:400;letter-spacing:.65em;color:rgba(232,229,221,.55);text-indent:.65em;text-transform:uppercase}',
      /* Cursor */
      '.cf-wp-cursor{position:fixed;top:0;left:0;width:8px;height:8px;background:#F2B54D;border-radius:50%;pointer-events:none;z-index:100000;transform:translate3d(-100px,-100px,0);transition:opacity .3s,background .25s,width .25s,height .25s;box-shadow:0 0 12px rgba(242,181,77,.7);opacity:0}',
      '.cf-wp-cursor-outer{position:fixed;top:0;left:0;width:40px;height:40px;border:1px solid rgba(242,181,77,.35);border-radius:50%;pointer-events:none;z-index:99999;transform:translate3d(-100px,-100px,0);transition:border-color .25s,opacity .3s,width .25s,height .25s,background .25s;opacity:0}',
      'body.cf-wp-cursor-ready .cf-wp-cursor,body.cf-wp-cursor-ready .cf-wp-cursor-outer{opacity:1}',
      'body.cf-wp-cursor-hover .cf-wp-cursor-outer{border-color:rgba(242,181,77,.8);background:rgba(242,181,77,.08);width:52px;height:52px}',
      'body.cf-wp-cursor-hover .cf-wp-cursor{background:#F5C870;width:6px;height:6px;box-shadow:0 0 18px rgba(242,181,77,.9)}',
      '@media (pointer:fine){body.cf-wp-cursor-ready,body.cf-wp-cursor-ready a,body.cf-wp-cursor-ready button,body.cf-wp-cursor-ready [role=button]{cursor:none}}',
      '@media (pointer:coarse){.cf-wp-cursor,.cf-wp-cursor-outer{display:none!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ---------- Inject Preloader DOM ----------
  function injectPreloader() {
    if (document.getElementById('cfWpPreloader')) return;
    var pre = document.createElement('div');
    pre.id = 'cfWpPreloader';
    pre.className = 'cf-wp-preloader';
    pre.setAttribute('aria-hidden', 'true');
    pre.innerHTML = [
      '<svg viewBox="0 0 200 200" fill="none" aria-hidden="true">',
      '<circle cx="100" cy="100" r="80" stroke="rgba(242,181,77,0.12)" stroke-width="1"/>',
      '<circle cx="100" cy="100" r="80" stroke="#F2B54D" stroke-width="1.5" stroke-linecap="round" ',
      'stroke-dasharray="502" stroke-dashoffset="502" class="cf-wp-pre-arc" transform="rotate(-90 100 100)"/>',
      '<circle cx="100" cy="100" r="54" stroke="rgba(242,181,77,0.3)" stroke-width="0.5" class="cf-wp-pre-pulse"/>',
      '<text x="100" y="108" text-anchor="middle" fill="#F2B54D" font-family="Georgia,serif" ',
      'font-size="28" font-weight="300" letter-spacing="4">CF</text>',
      '</svg>',
      '<div class="cf-wp-pre-label">CLARA&nbsp;FUTURA&nbsp;WORLD</div>'
    ].join('');
    document.body.insertBefore(pre, document.body.firstChild);

    var hide = function() {
      setTimeout(function() {
        pre.classList.add('is-hidden');
        setTimeout(function() { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 1200);
      }, 500);
    };
    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
    setTimeout(hide, 4500); // safety
  }

  // ---------- Inject Cursor DOM ----------
  function injectCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (document.getElementById('cfWpCursor')) return;

    var cursor = document.createElement('div');
    cursor.id = 'cfWpCursor';
    cursor.className = 'cf-wp-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    var outer = document.createElement('div');
    outer.id = 'cfWpCursorOuter';
    outer.className = 'cf-wp-cursor-outer';
    outer.setAttribute('aria-hidden', 'true');

    document.body.appendChild(cursor);
    document.body.appendChild(outer);

    var mx = -100, my = -100, ox = -100, oy = -100, ready = false;
    var hovered = false;
    var overIframe = false;

    document.addEventListener('mousemove', function(e) {
      mx = e.clientX; my = e.clientY;
      if (!ready) { ready = true; document.body.classList.add('cf-wp-cursor-ready'); }
      // Hide outer cursor when hovering over an iframe — only toggle on transition
      // to avoid writing styles on every move event.
      var tgt = e.target;
      var nowOverIframe = !!(tgt && tgt.tagName === 'IFRAME');
      if (nowOverIframe !== overIframe) {
        overIframe = nowOverIframe;
        cursor.style.opacity = nowOverIframe ? '0' : '';
        outer.style.opacity = nowOverIframe ? '0' : '';
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function() {
      cursor.style.opacity = '0'; outer.style.opacity = '0';
      overIframe = false;
    });
    document.addEventListener('mouseenter', function() {
      cursor.style.opacity = ''; outer.style.opacity = '';
      overIframe = false;
    });
    // Blur fires when iframe takes focus (mouse over it)
    window.addEventListener('blur', function() {
      cursor.style.opacity = '0'; outer.style.opacity = '0';
    });
    window.addEventListener('focus', function() {
      cursor.style.opacity = ''; outer.style.opacity = '';
      overIframe = false;
    });

    function tick() {
      // Only animate when the pointer has moved appreciably or hover-state changed.
      ox += (mx - ox) * 0.22;
      oy += (my - oy) * 0.22;
      var rh = hovered ? 26 : 20, dh = hovered ? 3 : 4;
      outer.style.transform = 'translate3d(' + (ox - rh) + 'px,' + (oy - rh) + 'px,0)';
      cursor.style.transform = 'translate3d(' + (mx - dh) + 'px,' + (my - dh) + 'px,0)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    var hoverSel = 'a,button,[role="button"],input,textarea,select,.wp-block-button__link,.cf-ambient-btn';
    document.addEventListener('mouseover', function(e) {
      if (e.target.closest && e.target.closest(hoverSel)) {
        hovered = true;
        document.body.classList.add('cf-wp-cursor-hover');
      }
    }, { passive: true });
    document.addEventListener('mouseout', function(e) {
      if (e.target.closest && e.target.closest(hoverSel)) {
        hovered = false;
        document.body.classList.remove('cf-wp-cursor-hover');
      }
    }, { passive: true });
  }

  function init() {
    injectPreloader();
    injectCursor();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ============================================================
   === Clara Futura — WordPress Click-to-Reveal Section Headers
   ============================================================ */
(function() {
  'use strict';

  // ---------- Inject CSS once ----------
  var CSS_ID = 'cf-wp-collapsible-css';
  if (!document.getElementById(CSS_ID)) {
    var style = document.createElement('style');
    style.id = CSS_ID;
    style.textContent = [
      '.cf-wp-collapsible{position:relative;transition:padding .6s ease}',
      '.cf-wp-collapsible.is-closed{padding-bottom:2.5rem!important}',
      '.cf-wp-collapsible.is-open{padding-bottom:5rem!important}',
      '.cf-wp-header-trigger{cursor:pointer;position:relative;padding-right:4rem;user-select:none;-webkit-tap-highlight-color:transparent;display:block}',
      '.cf-wp-header-trigger h2{transition:color .4s ease,text-shadow .4s ease}',
      '.cf-wp-header-trigger:hover h2{color:#F2B54D!important;text-shadow:0 0 22px rgba(242,181,77,.35)}',
      '.cf-wp-toggle-icon{position:absolute;right:0;top:50%;transform:translateY(-50%);width:44px;height:44px;border:1px solid rgba(242,181,77,.4);border-radius:50%;display:flex;align-items:center;justify-content:center;transition:transform .5s cubic-bezier(.16,1,.3,1),border-color .3s,background .3s;background:rgba(242,181,77,.04);box-sizing:border-box}',
      '.cf-wp-toggle-icon svg{width:16px;height:16px;transition:transform .5s cubic-bezier(.16,1,.3,1)}',
      '.cf-wp-header-trigger:hover .cf-wp-toggle-icon{border-color:#F2B54D;background:rgba(242,181,77,.12);transform:translateY(-50%) scale(1.08)}',
      '.cf-wp-collapsible.is-open .cf-wp-toggle-icon svg{transform:rotate(45deg)}',
      '.cf-wp-collapsible.is-open .cf-wp-toggle-icon{border-color:#F2B54D;background:rgba(242,181,77,.18)}',
      '.cf-wp-head-hint{display:block;margin-top:.75rem;font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;color:rgba(181,190,198,.7);font-weight:400;transition:color .35s ease,opacity .35s ease}',
      '.cf-wp-header-trigger:hover .cf-wp-head-hint{color:#F2B54D;opacity:1}',
      '.cf-wp-collapsible.is-open .cf-wp-head-hint{opacity:0;pointer-events:none;margin-top:0;max-height:0;overflow:hidden}',
      '.cf-wp-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .7s cubic-bezier(.16,1,.3,1),opacity .5s ease,margin-top .5s ease;opacity:0;margin-top:0}',
      '.cf-wp-collapsible.is-open .cf-wp-body{grid-template-rows:1fr;opacity:1;margin-top:2rem}',
      '.cf-wp-body-inner{overflow:hidden;min-height:0}',
      '.cf-wp-collapsible.is-open .cf-wp-body-inner>*{animation:cfWpChildIn .8s cubic-bezier(.16,1,.3,1) both}',
      '.cf-wp-collapsible.is-open .cf-wp-body-inner>*:nth-child(1){animation-delay:.25s}',
      '.cf-wp-collapsible.is-open .cf-wp-body-inner>*:nth-child(2){animation-delay:.35s}',
      '.cf-wp-collapsible.is-open .cf-wp-body-inner>*:nth-child(3){animation-delay:.45s}',
      '.cf-wp-collapsible.is-open .cf-wp-body-inner>*:nth-child(4){animation-delay:.55s}',
      '@keyframes cfWpChildIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}',
      /* === Pulsating-light animation on CLOSED tabs — BRIGHTER, WIDER RIPPLE === */
      '.cf-wp-collapsible.is-closed .cf-wp-toggle-icon{animation:cfWpTabPulse 2.6s ease-in-out infinite}',
      '.cf-wp-collapsible.is-closed .cf-wp-toggle-icon::before{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(242,181,77,.85);animation:cfWpTabRing 2.6s ease-out infinite;pointer-events:none;box-shadow:0 0 20px rgba(242,181,77,.5)}',
      '.cf-wp-collapsible.is-closed .cf-wp-toggle-icon::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:1.5px solid rgba(242,181,77,.6);animation:cfWpTabRing 2.6s ease-out infinite;animation-delay:1.3s;pointer-events:none}',
      '.cf-wp-collapsible.is-closed .cf-wp-head-hint{animation:cfWpHintBreathe 3s ease-in-out infinite}',
      '.cf-wp-header-trigger:hover .cf-wp-toggle-icon,.cf-wp-header-trigger:hover .cf-wp-head-hint{animation-play-state:paused}',
      '.cf-wp-header-trigger:hover .cf-wp-toggle-icon::before,.cf-wp-header-trigger:hover .cf-wp-toggle-icon::after{animation-play-state:paused;opacity:0}',
      '.cf-wp-collapsible.is-closed:nth-of-type(2n) .cf-wp-toggle-icon,.cf-wp-collapsible.is-closed:nth-of-type(2n) .cf-wp-toggle-icon::before,.cf-wp-collapsible.is-closed:nth-of-type(2n) .cf-wp-toggle-icon::after,.cf-wp-collapsible.is-closed:nth-of-type(2n) .cf-wp-head-hint{animation-delay:.9s}',
      '.cf-wp-collapsible.is-closed:nth-of-type(3n) .cf-wp-toggle-icon,.cf-wp-collapsible.is-closed:nth-of-type(3n) .cf-wp-toggle-icon::before,.cf-wp-collapsible.is-closed:nth-of-type(3n) .cf-wp-toggle-icon::after,.cf-wp-collapsible.is-closed:nth-of-type(3n) .cf-wp-head-hint{animation-delay:1.6s}',
      '@keyframes cfWpTabPulse{0%,100%{border-color:rgba(242,181,77,.55);background:rgba(242,181,77,.08);box-shadow:0 0 0 0 rgba(242,181,77,0)}50%{border-color:rgba(255,200,90,1);background:rgba(242,181,77,.28);box-shadow:0 0 40px 8px rgba(242,181,77,.75),0 0 80px 20px rgba(242,181,77,.35),0 0 0 14px rgba(242,181,77,.18)}}',
      '@keyframes cfWpTabRing{0%{transform:scale(1);opacity:.95;border-width:2px}80%,100%{transform:scale(3.2);opacity:0;border-width:.5px}}',
      '@keyframes cfWpHintBreathe{0%,100%{color:rgba(181,190,198,.7);opacity:.7;text-shadow:0 0 0 rgba(242,181,77,0)}50%{color:rgba(255,210,120,1);opacity:1;text-shadow:0 0 20px rgba(242,181,77,.75),0 0 40px rgba(242,181,77,.4)}}',
      '@media (prefers-reduced-motion:reduce){.cf-wp-collapsible.is-closed .cf-wp-toggle-icon,.cf-wp-collapsible.is-closed .cf-wp-toggle-icon::before,.cf-wp-collapsible.is-closed .cf-wp-toggle-icon::after,.cf-wp-collapsible.is-closed .cf-wp-head-hint{animation:none}}',
      /* === RESTRAINT PASS: suppress pulse until user engages === */
      'body:not(.cf-wp-engaged) .cf-wp-collapsible.is-closed .cf-wp-toggle-icon{animation:none;box-shadow:0 0 0 0 rgba(242,181,77,0) !important}',
      'body:not(.cf-wp-engaged) .cf-wp-collapsible.is-closed .cf-wp-toggle-icon::before,body:not(.cf-wp-engaged) .cf-wp-collapsible.is-closed .cf-wp-toggle-icon::after{animation:none;opacity:0}',
      'body:not(.cf-wp-engaged) .cf-wp-collapsible.is-closed .cf-wp-head-hint{animation:none}',
      /* Music button: quiet on first screen */
      '.ambient-music-btn{opacity:0.42;transition:opacity .6s cubic-bezier(.16,1,.3,1),border-color .3s,background .3s,transform .2s}',
      'body.cf-wp-scrolled .ambient-music-btn,.ambient-music-btn:hover,.ambient-music-btn:focus-visible{opacity:1}',
      'body:not(.cf-wp-scrolled) .ambient-pulse-ring{animation-play-state:paused;opacity:0}',
      /* === MOBILE MENU FIX v2 (Apr 2026) === */
      /* Force the open menu panel to fill the viewport + sit above iframes */
      '.wp-block-navigation__responsive-container.is-menu-open{position:fixed !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;width:100vw !important;height:100vh !important;min-height:100vh !important;max-height:none !important;z-index:2147483000 !important;background:#0C2137 !important;overflow-y:auto !important;overflow-x:hidden !important;display:block !important;padding:0 !important;margin:0 !important}',
      '.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-close{min-height:100vh !important;display:block !important;padding:0 !important;margin:0 !important;width:100% !important}',
      '.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-dialog{min-height:100vh !important;width:100% !important;display:block !important;padding:0 !important;margin:0 !important}',
      'body.cf-mobile-menu-open iframe{visibility:hidden !important}',
      /* Inner content wrapper */
      '.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-content{padding:5rem 2rem 3rem !important;max-width:460px !important;margin:0 auto !important;width:100% !important;display:block !important;box-sizing:border-box !important}',
      /* Reset the UL flex layout to vertical stack */
      '.wp-block-navigation__responsive-container.is-menu-open ul.wp-block-navigation__container,.wp-block-navigation__responsive-container.is-menu-open ul.wp-block-page-list{display:flex !important;flex-direction:column !important;gap:0 !important;list-style:none !important;padding:0 !important;margin:0 !important;width:100% !important;align-items:stretch !important;justify-content:flex-start !important}',
      '.wp-block-navigation__responsive-container.is-menu-open li{list-style:none !important;padding:0 !important;margin:0 !important;width:100% !important;display:block !important;border-bottom:1px solid rgba(181,190,198,0.12) !important}',
      '.wp-block-navigation__responsive-container.is-menu-open li:last-child{border-bottom:none !important}',
      '.wp-block-navigation__responsive-container.is-menu-open li a{display:block !important;width:100% !important;padding:1.15rem 0.25rem !important;font-size:1.05rem !important;letter-spacing:0.01em !important;color:#E8E5DD !important;text-decoration:none !important;font-weight:400 !important;background:transparent !important;border:none !important;box-shadow:none !important;text-align:left !important;transition:color .25s ease,padding-left .3s ease}',
      '.wp-block-navigation__responsive-container.is-menu-open li a:hover,.wp-block-navigation__responsive-container.is-menu-open li a:focus{color:#F2B54D !important;padding-left:0.5rem !important}',
      '.wp-block-navigation__responsive-container.is-menu-open li.current-menu-item a,.wp-block-navigation__responsive-container.is-menu-open li a[aria-current="page"]{color:#F2B54D !important;outline:none !important;border:none !important;box-shadow:none !important}',
      '.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-close{position:absolute !important;color:#F2B54D !important;top:1.25rem !important;right:1.25rem !important;z-index:10 !important;background:transparent !important;border:none !important}',
      '.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-close svg{width:28px !important;height:28px !important;fill:#F2B54D !important}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // === MOBILE MENU: rewrite obscure labels + toggle body class so iframes hide ===
  function cfRewriteMenuLabels() {
    var map = {
      'beyond the selfish gene': 'Research',
      'the hard problem': 'Consciousness',
      'case studies & endorsements': 'Case Studies',
      'case studies &amp; endorsements': 'Case Studies',
      'clara futura world': 'Home'
    };
    var links = document.querySelectorAll('.wp-block-navigation__container a, .wp-block-page-list a');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.dataset.cfRenamed) continue;
      var t = (a.textContent || '').trim().toLowerCase();
      if (map[t]) {
        a.textContent = map[t];
        a.dataset.cfRenamed = '1';
      }
    }
  }

  function cfWatchMobileMenu() {
    // Toggle body class whenever the menu open/close state changes
    var update = function() {
      var open = !!document.querySelector('.wp-block-navigation__responsive-container.is-menu-open');
      document.body.classList.toggle('cf-mobile-menu-open', open);
    };
    update();
    var mo = new MutationObserver(function(muts) {
      cfRewriteMenuLabels();
      update();
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
  }

  // Kick off label rewrite early and watch the menu
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { cfRewriteMenuLabels(); cfWatchMobileMenu(); });
  } else {
    cfRewriteMenuLabels();
    cfWatchMobileMenu();
  }

  function makeToggleIcon() {
    var wrap = document.createElement('span');
    wrap.className = 'cf-wp-toggle-icon';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<svg viewBox="0 0 16 16" fill="none">' +
        '<line x1="8" y1="2" x2="8" y2="14" stroke="#F2B54D" stroke-width="1.25" stroke-linecap="round"/>' +
        '<line x1="2" y1="8" x2="14" y2="8" stroke="#F2B54D" stroke-width="1.25" stroke-linecap="round"/>' +
      '</svg>';
    return wrap;
  }

  function buildCollapsibleFor(group, openByDefault) {
    // Find the inner constrained wrapper (where blocks live)
    var inner = group.querySelector(':scope > .wp-block-group') || group;
    // Find the h2 within
    var h2 = inner.querySelector(':scope > h2');
    if (!h2) return;
    if (inner.querySelector('.cf-wp-header-trigger')) return;

    // Build trigger wrapping just the h2 + hint + icon
    var trigger = document.createElement('div');
    trigger.className = 'cf-wp-header-trigger';
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-expanded', openByDefault ? 'true' : 'false');

    // Move h2 into trigger
    var h2Parent = h2.parentElement;
    trigger.appendChild(h2);
    trigger.appendChild(makeToggleIcon());

    var hint = document.createElement('span');
    hint.className = 'cf-wp-head-hint';
    hint.textContent = 'Click to expand';
    trigger.appendChild(hint);

    // Insert trigger in h2's old position
    h2Parent.insertBefore(trigger, h2Parent.firstChild);

    // Gather everything after trigger into body
    var body = document.createElement('div');
    body.className = 'cf-wp-body';
    var bodyInner = document.createElement('div');
    bodyInner.className = 'cf-wp-body-inner';
    body.appendChild(bodyInner);

    var remaining = [];
    Array.prototype.forEach.call(h2Parent.children, function(child) {
      if (child === trigger) return;
      remaining.push(child);
    });
    remaining.forEach(function(c) { bodyInner.appendChild(c); });

    h2Parent.appendChild(body);

    group.classList.add('cf-wp-collapsible');
    group.classList.add(openByDefault ? 'is-open' : 'is-closed');

    function toggle() {
      var isOpen = group.classList.contains('is-open');
      if (isOpen) {
        group.classList.remove('is-open');
        group.classList.add('is-closed');
        trigger.setAttribute('aria-expanded', 'false');
        hint.textContent = 'Click to expand';
      } else {
        group.classList.remove('is-closed');
        group.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        hint.textContent = 'Click to close';
        // Ensure any scroll-reveal'd children become visible immediately
        bodyInner.querySelectorAll('.cf-reveal, .wp-block-group, .wp-block-columns, .wp-block-image, .wp-block-quote, p, figure').forEach(function(el) {
          el.classList.add('cf-visible');
          el.style.opacity = '';
          el.style.transform = '';
        });
        setTimeout(function() {
          var rect = group.getBoundingClientRect();
          if (rect.top < 110 || rect.top > window.innerHeight * 0.4) {
            window.scrollTo({ top: window.scrollY + rect.top - 110, behavior: 'smooth' });
          }
        }, 50);
      }
    }

    trigger.addEventListener('click', toggle);
    trigger.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  function initWpCollapsibles() {
    // Find every top-level .wp-block-group.alignfull that contains an h2
    var candidates = document.querySelectorAll('.entry-content .wp-block-group.alignfull, main .wp-block-group.alignfull');
    var groups = [];
    Array.prototype.forEach.call(candidates, function(g) {
      // Must contain an h2 (direct or in immediate inner group)
      var inner = g.querySelector(':scope > .wp-block-group') || g;
      var h2 = inner.querySelector(':scope > h2');
      if (!h2) return;
      // Skip if the group is INSIDE a cover/hero
      if (g.closest('.wp-block-cover')) return;
      // Skip groups already inside another collapsible
      if (g.closest('.cf-wp-collapsible') && g.closest('.cf-wp-collapsible') !== g) return;
      groups.push(g);
    });

    // First group is open by default so users see content immediately
    groups.forEach(function(g, i) {
      buildCollapsibleFor(g, false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWpCollapsibles);
  } else {
    initWpCollapsibles();
  }

  // === RESTRAINT PASS (Apr 2026) ===
  // cf-wp-scrolled: first real scroll > 40px
  // cf-wp-engaged: scrolled > 60% of viewport height
  var wpScrolled = false, wpEngaged = false;
  function onWpScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (!wpScrolled && y > 40) {
      wpScrolled = true;
      document.body.classList.add('cf-wp-scrolled');
    }
    if (!wpEngaged && y > (window.innerHeight * 0.6)) {
      wpEngaged = true;
      document.body.classList.add('cf-wp-engaged');
    }
    if (wpScrolled && wpEngaged) {
      window.removeEventListener('scroll', onWpScroll);
    }
  }
  window.addEventListener('scroll', onWpScroll, { passive: true });
})();
