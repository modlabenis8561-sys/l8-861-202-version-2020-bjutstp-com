(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initPageFilter() {
    var panel = qs('[data-page-filter]');
    var list = qs('[data-filter-list]');
    if (!panel || !list) {
      return;
    }
    var keyword = qs('[data-filter-keyword]', panel);
    var type = qs('[data-filter-type]', panel);
    var year = qs('[data-filter-year]', panel);
    var cards = qsa('.movie-card', list);
    function apply() {
      var k = normalize(keyword && keyword.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var ok = true;
        if (k && haystack.indexOf(k) === -1) {
          ok = false;
        }
        if (t && normalize(card.getAttribute('data-type')) !== t) {
          ok = false;
        }
        if (y && normalize(card.getAttribute('data-year')) !== y) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
      });
    }
    [keyword, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
    panel.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
  }

  function initSearchPage() {
    var box = qs('[data-search-results]');
    if (!box || !window.SITE_MOVIES) {
      return;
    }
    var input = qs('[data-main-search]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input) {
      input.value = q;
    }
    function render(value) {
      var key = normalize(value);
      var movies = window.SITE_MOVIES.filter(function (movie) {
        return normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ')).indexOf(key) !== -1;
      }).slice(0, 120);
      box.innerHTML = movies.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="card-cover" href="' + movie.url + '">' +
          '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">' +
          '<span class="score">' + movie.rating + '</span>' +
          '</a>' +
          '<div class="card-body">' +
          '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>' +
          '<p>' + movie.oneLine + '</p>' +
          '<div class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
      if (!movies.length) {
        box.innerHTML = '<p class="empty-note">未找到匹配影片</p>';
      }
    }
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(q || '');
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (box) {
      var video = qs('video', box);
      var button = qs('.play-overlay', box);
      var stream = box.getAttribute('data-stream');
      var bound = false;
      if (!video || !stream) {
        return;
      }
      function bind() {
        if (bound) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        bound = true;
      }
      function play() {
        bind();
        box.classList.add('is-playing');
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            box.classList.remove('is-playing');
          });
        }
      }
      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          box.classList.remove('is-playing');
        }
      });
      video.addEventListener('click', function () {
        if (!bound) {
          play();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchForms();
    initPageFilter();
    initSearchPage();
    initPlayers();
  });
})();
