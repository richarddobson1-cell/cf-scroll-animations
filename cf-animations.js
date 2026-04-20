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
  var audio = document.createElement('audio');
  audio.preload = 'auto';
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
    '.cf-ambient-btn{position:fixed;bottom:28px;right:28px;z-index:9999;width:48px;height:48px;border-radius:50%;',
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
    '@media(max-width:600px){.cf-ambient-btn{bottom:16px;right:16px;width:42px;height:42px;}.cf-ambient-btn svg{width:15px;height:15px;}}'
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
