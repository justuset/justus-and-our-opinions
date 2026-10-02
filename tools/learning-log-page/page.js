// Learning log page behavior: running head, current part, read markers and a resume link.
// Read markers live in this browser only (localStorage), and every access is guarded so the page works without it.
(function () {
  var KEY = 'oo-learning-log-read';
  var LAST = 'oo-learning-log-last';
  function load(k, fallback) {
    try {
      var v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  }
  function save(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      // storage blocked (private window, previews): read dots just won't persist
    }
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('section.card[id]:not(#g0)'));
  var read = load(KEY, {});
  var progress = document.getElementById('progress');
  function paint() {
    var n = 0;
    cards.forEach(function (c) {
      var on = !!read[c.id];
      if (on) n++;
      var dot = document.querySelector('.t-done[data-for="' + c.id + '"]');
      if (dot) dot.classList.toggle('on', on);
    });
    if (progress) progress.textContent = n ? n + ' read' : '';
  }
  paint();

  // A card counts as read once its end has scrolled into view.
  if ('IntersectionObserver' in window) {
    var endObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.closest('section.card').id;
        if (!read[id]) {
          read[id] = 1;
          save(KEY, read);
          paint();
        }
      });
    });
    cards.forEach(function (c) {
      var b = c.querySelector('.back');
      if (b) endObs.observe(b);
    });
  }

  // Resume where you left off.
  var resume = document.getElementById('resume');
  var resumeText = document.getElementById('resume-text');
  var last = load(LAST, null);
  if (last && document.getElementById(last)) {
    var lastCard = document.getElementById(last);
    var label = lastCard.querySelector('.eyebrow .enum');
    resume.setAttribute('href', '#' + last);
    resumeText.textContent =
      'Continue reading  ·  ' + (label ? label.textContent + ', ' : '') + lastCard.querySelector('h3').textContent;
  }

  // Running head: appears once the section bar has scrolled away; underlines the current part.
  var runhead = document.getElementById('runhead');
  var sectionbar = document.querySelector('.sectionbar');
  var links = Array.prototype.slice.call(document.querySelectorAll('.rh-link'));
  var slider = document.getElementById('rh-slider');
  var marks = Array.prototype.slice.call(document.querySelectorAll('.part[data-part], section.card[data-part]'));
  var ticking = false;
  var current = '';
  function update() {
    ticking = false;
    var show = sectionbar.getBoundingClientRect().bottom < 0;
    runhead.classList.toggle('show', show);
    if (show) {
      runhead.removeAttribute('aria-hidden');
      runhead.removeAttribute('inert');
    } else {
      runhead.setAttribute('aria-hidden', 'true');
      runhead.setAttribute('inert', '');
    }
    var part = '';
    var card = '';
    for (var i = 0; i < marks.length; i++) {
      if (marks[i].getBoundingClientRect().top < 140) {
        part = marks[i].getAttribute('data-part');
        if (marks[i].matches('section.card')) card = marks[i].id;
      } else break;
    }
    if (card && card !== 'g0') save(LAST, card);
    if (part !== current) {
      current = part;
      links.forEach(function (a) {
        var on = a.getAttribute('data-part') === part;
        a.classList.toggle('on', on);
        if (on && slider) {
          var left = a.offsetLeft - slider.offsetLeft - 12;
          slider.scrollTo({
            left: Math.max(0, left),
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          });
        }
      });
    }
  }
  addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  addEventListener('resize', update);
  update();

  // Opening a link to a chapter opens the contents if it's the contents list itself.
  document.querySelectorAll('a[href="#contents"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var t = document.getElementById('contents');
      if (t) t.open = true;
    });
  });
})();
