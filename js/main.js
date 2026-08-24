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
  var formOk = document.getElementById('formSuccess');
  var formError = document.getElementById('formError');
  if (form) {
    /* 关闭浏览器原生验证弹框，我们自己校验更可控 */
    form.setAttribute('novalidate', 'novalidate');

    /* ===== 预约表单接收配置 =====
     * LEAD_URL：同源中转接口（与 index.html 同目录的 lead.php），
     *           解决浏览器直连企业微信 webhook 被 CORS 拦截的问题。
     * WEBHOOK ：企业微信群机器人 webhook，仅作直连兜底。
     */
    var LEAD_URL = '/lead.php';
    var WEBHOOK = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=3cf0ee8e-4e94-4aba-ac83-ca542affa0c7';

    function collectFormData() {
      var v = function (sel) {
        var el = form.querySelector(sel);
        return el ? el.value.trim() : '';
      };
      return {
        name: v('input[type="text"]'),
        tel: v('input[type="tel"]'),
        type: v('select'),
        desc: v('textarea') || '未填写',
        time: new Date().toLocaleString('zh-CN'),
        page: location.href
      };
    }

    function showOk() {
      if (formError) formError.hidden = true;
      if (formOk) { formOk.hidden = false; formOk.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      if (toast) { toast.classList.add('show'); setTimeout(function () { toast.classList.remove('show'); }, 3200); }
    }
    function showFail() {
      if (formOk) formOk.hidden = true;
      if (formError) { formError.hidden = false; formError.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
    function setLoading(btn, on) {
      if (!btn) return;
      if (on) { btn.dataset.oriText = btn.textContent; btn.textContent = '提交中…'; btn.disabled = true; btn.style.opacity = '.7'; }
      else { btn.textContent = btn.dataset.oriText || '提交预约'; btn.disabled = false; btn.style.opacity = ''; }
    }
    function validForm() {
      /* 必填检查：称呼、手机、企业类型 */
      var name = form.querySelector('input[type="text"]');
      var tel = form.querySelector('input[type="tel"]');
      var type = form.querySelector('select');
      var ok = true;
      [name, tel, type].forEach(function (el) {
        if (!el) return;
        if (!el.value || !el.value.trim()) { el.style.borderColor = '#e8541f'; ok = false; }
        else { el.style.borderColor = ''; }
      });
      if (tel && tel.value && !/^1[3-9]\d{9}$/.test(tel.value.trim())) { tel.style.borderColor = '#e8541f'; ok = false; }
      return ok;
    }
    function postJSON(url, obj) {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.errcode === 0) return true;
        throw new Error((j && j.errmsg) || 'send failed');
      });
    }
    /* 防重入标记：form submit 与 button click 双绑，个别浏览器下可能触发两次提交，
     * 加标记避免同一条预约重复发送到企业微信群。 */
    var submitting = false;
    function handleSubmit() {
      if (submitting) return;
      if (!validForm()) return;
      var btn = form.querySelector('button[type="submit"]');
      setLoading(btn, true);
      var d = collectFormData();
      submitting = true;

      /* 优先走同源中转接口 lead.php；失败再兜底直连 webhook */
      postJSON(LEAD_URL, d).catch(function () {
        return postJSON(WEBHOOK, {
          msgtype: 'markdown',
          markdown: {
            content: '📋 **虾记代账官网新预约**\n'
              + '> **称呼**：' + d.name + '\n'
              + '> **手机**：' + d.tel + '\n'
              + '> **企业类型**：' + d.type + '\n'
              + '> **需求**：' + d.desc + '\n'
              + '> **时间**：' + d.time + '\n'
              + '> **来源**：' + d.page
          }
        });
      }).then(function () {
        form.reset(); setLoading(btn, false); showOk();
      }).catch(function () {
        setLoading(btn, false); showFail();
      }).then(function () {
        submitting = false;
      });
    }
    /* 双重绑定：form submit + button click 兜底，避免任何原因导致 submit 事件没触发 */
    form.addEventListener('submit', function (e) { e.preventDefault(); handleSubmit(); });
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.addEventListener('click', function (e) { e.preventDefault(); handleSubmit(); });
  }
})();
