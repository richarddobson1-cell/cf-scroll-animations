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
