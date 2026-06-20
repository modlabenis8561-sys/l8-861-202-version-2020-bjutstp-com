(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;

    function activateSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            activateSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            activateSlide(currentSlide + 1);
        }, 5200);
    }

    function applyFilters(scope) {
        var input = scope.querySelector(".search-input");
        var chips = Array.prototype.slice.call(scope.querySelectorAll(".filter-chip"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(scope.getAttribute("data-target") || ".movie-card"));
        var empty = document.querySelector(scope.getAttribute("data-empty") || "");
        var activeFilter = "all";

        function refresh() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var region = card.getAttribute("data-region") || "";
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedFilter = activeFilter === "all" || type === activeFilter || region === activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                var matched = matchedQuery && matchedFilter;

                card.classList.toggle("is-hidden", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", refresh);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                refresh();
            });
        });

        refresh();
    }

    Array.prototype.slice.call(document.querySelectorAll(".search-panel")).forEach(applyFilters);

    function initPlayer(shell) {
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");
        var button = shell.querySelector(".player-play");
        var error = shell.querySelector(".player-error");
        var streamUrl = shell.getAttribute("data-stream");
        var isReady = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function showError() {
            if (error) {
                error.textContent = "视频暂时无法播放，请稍后再试";
                error.classList.add("show");
            }
        }

        function attach() {
            if (isReady) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                isReady = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError();
                    }
                });
                isReady = true;
                return;
            }

            video.src = streamUrl;
            isReady = true;
        }

        function start() {
            attach();

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(showError);
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("is-hidden");
            }
        });

        video.addEventListener("error", showError);

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(initPlayer);
})();
