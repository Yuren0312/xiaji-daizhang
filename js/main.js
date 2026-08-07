/* ===== 虾记代账官网交互 ===== */
(function () {
  'use strict';

  /* 导航栏滚动效果 */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 移动端菜单 */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  /* 滚动显现动画 */
  var revealEls = document.querySelectorAll('.card, .svc-card, .svc-item, .price-card, .case-card, .faq-item, .contact-info, .contact-form, .stat');
  if ('IntersectionObserver' in window) {
    revealEls.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* FAQ 手风琴 */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      /* 关闭其他 */
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = isOpen ? null : a.scrollHeight + 'px';
    });
  });

  /* 数字滚动 */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var dur = 1600, start = null;
    function fmt(n) {
      return n >= 10000 ? (n / 10000).toFixed(n >= 1000000 ? 0 : 1) : String(Math.round(n));
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * ease);
      el.textContent = fmt(val) + (target >= 10000 ? ' 万' : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var statObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var num = e.target.querySelector('.stat-num');
        if (num) animateCount(num);
        statObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.stat').forEach(function (s) { statObs.observe(s); });

  /* 表单提交提示 */
  var form = document.getElementById('contactForm');
  var toast = document.getElementById('toast');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.reset();
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 3200);
    });
  }
})();
