(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function closeResults(box) {
    if (box) {
      box.hidden = true;
      box.innerHTML = "";
    }
  }

  function renderResults(input) {
    var wrap = input.parentElement;
    var box = wrap ? wrap.querySelector(".search-results") : null;
    if (!box || typeof MOVIE_INDEX === "undefined") {
      return;
    }
    var query = input.value.trim().toLowerCase();
    if (!query) {
      closeResults(box);
      return;
    }
    var results = MOVIE_INDEX.filter(function (item) {
      return [item.title, item.region, item.year, item.type, item.genre, item.tags].join(" ").toLowerCase().indexOf(query) !== -1;
    }).slice(0, 14);
    if (!results.length) {
      box.innerHTML = '<div class="empty-result">没有找到相关影片</div>';
      box.hidden = false;
      return;
    }
    box.innerHTML = results.map(function (item) {
      return [
        '<a href="' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '">',
        '<span><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.year + '年 · ' + item.type + '</span></span>',
        '</a>'
      ].join('');
    }).join('');
    box.hidden = false;
  }

  function initSearch() {
    selectAll(".site-search-input").forEach(function (input) {
      input.addEventListener("input", function () {
        renderResults(input);
      });
      input.addEventListener("focus", function () {
        renderResults(input);
      });
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".header-search") && !event.target.closest(".hero-search-panel") && !event.target.closest(".large-search-box") && !event.target.closest(".mobile-search-wrap")) {
        selectAll(".search-results").forEach(closeResults);
      }
    });
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.hidden;
      nav.hidden = !opened;
      button.setAttribute("aria-expanded", String(opened));
      button.textContent = opened ? "×" : "☰";
    });
  }

  function initHero() {
    var slides = selectAll(".hero-slide");
    if (!slides.length) {
      return;
    }
    var dots = selectAll(".hero-dot");
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    restart();
  }

  function initFilters() {
    var input = document.querySelector(".page-filter-input");
    var buttons = selectAll(".filter-button");
    var cards = selectAll(".listing-grid .movie-card");
    if (!cards.length) {
      return;
    }
    var state = {
      type: "",
      year: "",
      query: ""
    };
    function apply() {
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.genre].join(" ").toLowerCase();
        var matchedType = !state.type || card.dataset.type === state.type;
        var matchedYear = !state.year || card.dataset.year === state.year;
        var matchedQuery = !state.query || text.indexOf(state.query) !== -1;
        card.classList.toggle("hidden-card", !(matchedType && matchedYear && matchedQuery));
      });
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (button.dataset.filterAll) {
          state.type = "";
          state.year = "";
          buttons.forEach(function (item) { item.classList.remove("active"); });
          button.classList.add("active");
        }
        if (button.dataset.filterType) {
          state.type = state.type === button.dataset.filterType ? "" : button.dataset.filterType;
          selectAll("[data-filter-type]").forEach(function (item) { item.classList.remove("active"); });
          if (state.type) {
            button.classList.add("active");
          }
          selectAll("[data-filter-all]").forEach(function (item) { item.classList.remove("active"); });
        }
        if (button.dataset.filterYear) {
          state.year = state.year === button.dataset.filterYear ? "" : button.dataset.filterYear;
          selectAll("[data-filter-year]").forEach(function (item) { item.classList.remove("active"); });
          if (state.year) {
            button.classList.add("active");
          }
          selectAll("[data-filter-all]").forEach(function (item) { item.classList.remove("active"); });
        }
        if (!state.type && !state.year) {
          selectAll("[data-filter-all]").forEach(function (item) { item.classList.add("active"); });
        }
        apply();
      });
    });
    if (input) {
      input.addEventListener("input", function () {
        state.query = input.value.trim().toLowerCase();
        apply();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initSearch();
    initHero();
    initFilters();
  });
})();
