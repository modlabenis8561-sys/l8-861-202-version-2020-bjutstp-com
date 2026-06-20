(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector(".menu-button");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll(".hero-dot", hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }
        function start() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        start();
    }

    function initLibrarySearch() {
        var panel = document.querySelector("[data-library-search]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("input");
        var cards = selectAll(".movie-card[data-search]");
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            input.value = query;
        }
        function filter() {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                card.classList.toggle("is-filtered-out", value && text.indexOf(value) === -1);
            });
        }
        input.addEventListener("input", filter);
        filter();
    }

    window.initMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !source) {
            return;
        }
        var started = false;
        function play() {
            button.classList.add("is-hidden");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (video.getAttribute("src") !== source) {
                    video.setAttribute("src", source);
                }
                video.play().catch(function () {});
                started = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!video._movieHls) {
                    video._movieHls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    video._movieHls.loadSource(source);
                    video._movieHls.attachMedia(video);
                    video._movieHls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.play().catch(function () {});
                }
                started = true;
                return;
            }
            if (video.getAttribute("src") !== source) {
                video.setAttribute("src", source);
            }
            video.play().catch(function () {});
            started = true;
        }
        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                play();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initLibrarySearch();
    });
})();
