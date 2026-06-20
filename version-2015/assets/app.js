(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5000);
      });
    });
    timer = setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function resultItem(movie) {
    return [
      '<a class="search-result-item" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, "&quot;") + '">',
      '<div><strong>' + movie.title + '</strong><small>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</small></div>',
      '</a>'
    ].join("");
  }

  function setupGlobalSearch() {
    var input = document.getElementById("site-search");
    var results = document.querySelector(".search-results");
    var movies = window.SEARCH_MOVIES || [];
    if (!input || !results || !movies.length) {
      return;
    }
    input.addEventListener("input", function () {
      var query = normalize(input.value);
      if (!query) {
        results.classList.remove("is-open");
        results.innerHTML = "";
        return;
      }
      var found = movies.filter(function (movie) {
        return normalize(movie.search).indexOf(query) !== -1;
      }).slice(0, 14);
      if (!found.length) {
        results.innerHTML = '<div class="search-result-item"><div></div><div><strong>没有找到相关影片</strong><small>可以尝试其他关键词</small></div></div>';
      } else {
        results.innerHTML = found.map(resultItem).join("");
      }
      results.classList.add("is-open");
    });
    document.addEventListener("click", function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        results.classList.remove("is-open");
      }
    });
  }

  function setupCardFilter() {
    var input = document.querySelector("[data-card-search]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        card.classList.toggle("is-filtered-out", query && text.indexOf(query) === -1);
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupGlobalSearch();
    setupCardFilter();
  });
})();

function initMoviePlayer(videoId, buttonId, sourceUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button || !sourceUrl) {
    return;
  }
  var loaded = false;
  var hls = null;

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function start() {
    loadSource();
    button.classList.add("is-hidden");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", start);
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove("is-hidden");
    }
  });
  video.addEventListener("ended", function () {
    button.classList.remove("is-hidden");
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
