(function() {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img[data-cover]").forEach(function(img) {
    img.addEventListener("error", function() {
      img.classList.add("image-hidden");
    });
  });

  document.querySelectorAll("[data-hero]").forEach(function(hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-slide-to]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-slide-to")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5000);
    }
  });

  document.querySelectorAll("[data-search-input]").forEach(function(input) {
    var scope = input.closest("section") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty-message]");

    input.addEventListener("input", function() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function(card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  });

  window.initializeMoviePlayer = function(options) {
    if (!options) {
      return;
    }

    var video = document.querySelector(options.videoSelector);
    var button = document.querySelector(options.buttonSelector);
    var shell = document.querySelector(options.shellSelector);
    var source = options.source;
    var loaded = false;
    var hls = null;

    if (!video || !button || !source) {
      return;
    }

    function start() {
      if (shell) {
        shell.classList.add("is-playing");
      }

      if (loaded) {
        video.play().catch(function() {});
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function() {
          video.play().catch(function() {});
        }, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
        return;
      }

      video.src = source;
      video.play().catch(function() {});
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function() {
      if (!loaded) {
        start();
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
