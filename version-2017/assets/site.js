(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        var params = new URLSearchParams(window.location.search);
        var searchInput = document.querySelector("[data-search-input]");
        var categoryFilter = document.querySelector("[data-category-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var emptyState = document.querySelector("[data-empty-state]");

        if (searchInput && params.get("q")) {
            searchInput.value = params.get("q");
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function runFilter() {
            if (!cards.length) {
                return;
            }

            var keyword = normalize(searchInput ? searchInput.value : "");
            var category = categoryFilter ? categoryFilter.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-keywords"));
                var cardCategory = card.getAttribute("data-category") || "";
                var matchedText = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedCategory = !category || cardCategory === category;
                var matched = matchedText && matchedCategory;

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", runFilter);
        }

        if (categoryFilter) {
            categoryFilter.addEventListener("change", runFilter);
        }

        runFilter();
    });
})();
