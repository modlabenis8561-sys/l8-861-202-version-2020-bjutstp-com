(function () {
    function bySelector(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var links = document.querySelector('[data-nav-links]');
        var search = document.querySelector('[data-header-search]');
        if (!button || !links || !search) {
            return;
        }
        button.addEventListener('click', function () {
            links.classList.toggle('open');
            search.classList.toggle('open');
        });
    }

    function setupSearchForms() {
        bySelector('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = 'search.html?q=' + encodeURIComponent(query);
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = bySelector('[data-hero-slide]', hero);
        var dots = bySelector('[data-hero-dot]', hero);
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5600);
    }

    function setupPlayer() {
        bySelector('[data-player]').forEach(function (wrap) {
            var video = wrap.querySelector('video');
            var source = video ? video.querySelector('source') : null;
            var button = wrap.querySelector('[data-play-button]');
            var sourceUrl = source ? source.getAttribute('src') : '';
            var hlsInstance = null;
            var prepared = false;

            function prepare() {
                if (!video || prepared) {
                    return;
                }
                prepared = true;
                if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = sourceUrl;
                } else {
                    video.src = sourceUrl;
                }
            }

            function play() {
                if (!video) {
                    return;
                }
                prepare();
                wrap.classList.add('is-playing');
                var playback = video.play();
                if (playback && playback.catch) {
                    playback.catch(function () {
                        wrap.classList.remove('is-playing');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener('play', function () {
                    wrap.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    wrap.classList.remove('is-playing');
                });
                video.addEventListener('ended', function () {
                    wrap.classList.remove('is-playing');
                });
            }
        });
    }

    function setupSearchPage() {
        var mount = document.querySelector('[data-search-results]');
        if (!mount || !window.SearchData) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-input]');
        if (input) {
            input.value = query;
        }
        if (!query) {
            mount.innerHTML = '<p class="section-desc">输入影片名称、地区、类型、年份或标签即可检索片库。</p>';
            return;
        }
        var lower = query.toLowerCase();
        var results = window.SearchData.filter(function (item) {
            return item.search.toLowerCase().indexOf(lower) !== -1;
        }).slice(0, 120);
        if (!results.length) {
            mount.innerHTML = '<p class="section-desc">没有找到匹配结果，换一个关键词试试。</p>';
            return;
        }
        mount.innerHTML = '<div class="grid movie-grid">' + results.map(function (item) {
            return [
                '<article class="movie-card">',
                '<a href="' + item.url + '">',
                '<div class="poster">',
                '<img src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" onerror="this.classList.add(\'image-hidden\')">',
                '<span class="poster-label">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</span>',
                '</div>',
                '<div class="card-body">',
                '<h2 class="card-title">' + escapeHtml(item.title) + '</h2>',
                '<p class="card-desc">' + escapeHtml(item.desc) + '</p>',
                '<div class="card-meta"><span class="badge">' + escapeHtml(item.type) + '</span><span class="badge">' + escapeHtml(item.genre) + '</span></div>',
                '</div>',
                '</a>',
                '</article>'
            ].join('');
        }).join('') + '</div>';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupPlayer();
        setupSearchPage();
    });
}());
