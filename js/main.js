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
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* 页脚年份自动更新 */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* 工作台 mockup 动态日期（每月 15 日为申报截止日） */
  (function () {
    var todayEl = document.getElementById('appToday');
    var countEl = document.getElementById('appCountdown');
    if (!todayEl || !countEl) return;
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
    todayEl.textContent = m + ' 月 ' + d + ' 日';
    var due = new Date(y, m, 15); /* 下月 15 日 */
    var days = Math.ceil((due - now) / 86400000);
    if (days > 0 && days <= 31) {
      countEl.textContent = '距离报税截止还有 ' + days + ' 天';
    } else if (days > 31) {
      countEl.textContent = '本月申报已完成 · 下期申报倒计时 ' + days + ' 天';
    } else {
      countEl.textContent = '本月申报期已结束，请关注下月申报';
    }
  })();

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
      if (n >= 10000) {
        var w = n / 10000;
        return (w >= 100 || w % 1 === 0 ? String(Math.round(w * 10) / 10) : w.toFixed(1));
      }
      return String(Math.round(n));
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

  /* 表单提交提示（防重复提交） */
  var form = document.getElementById('contactForm');
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn.disabled) return; /* 防重复提交 */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      btn.disabled = true;
      var old = btn.textContent;
      btn.textContent = '提交中…';
      /* 静态演示站点：这里可替换为真实接口（如表单后端/云函数） */
      setTimeout(function () {
        form.reset();
        btn.disabled = false;
        btn.textContent = old;
        showToast('✅ 提交成功！专属顾问将尽快与您联系。');
      }, 600);
    });
  }
})();
