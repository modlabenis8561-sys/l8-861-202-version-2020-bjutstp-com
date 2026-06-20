(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function includesText(value, query) {
        return String(value || "").toLowerCase().indexOf(query) !== -1;
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var listId = panel.getAttribute("data-filter-panel");
            var list = document.getElementById(listId);
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var empty = list.nextElementSibling && list.nextElementSibling.hasAttribute("data-empty-state") ? list.nextElementSibling : null;
            var searchInput = panel.querySelector("[data-filter-search]");
            var categorySelect = panel.querySelector("[data-filter-category]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            function apply() {
                var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
                var category = categorySelect ? categorySelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-genre")
                    ].join(" ").toLowerCase();
                    var matchesQuery = !query || includesText(haystack, query);
                    var matchesCategory = !category || card.getAttribute("data-category") === category;
                    var matchesType = !type || includesText(card.getAttribute("data-type"), type) || includesText(card.getAttribute("data-genre"), type);
                    var matchesYear = !year || card.getAttribute("data-year") === year;
                    var matched = matchesQuery && matchesCategory && matchesType && matchesYear;
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [searchInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    window.bindMoviePlayer = function (url) {
        var card = document.querySelector("[data-player]");
        if (!card) {
            return;
        }
        var video = card.querySelector("video");
        var overlay = card.querySelector(".player-overlay");
        if (!video || !overlay) {
            return;
        }
        var started = false;
        var hlsInstance = null;
        function attach() {
            if (!started) {
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new Hls({ enableWorker: true });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
            }
            overlay.classList.add("is-hidden");
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }
        overlay.addEventListener("click", attach);
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                attach();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initFilters();
    });
})();
