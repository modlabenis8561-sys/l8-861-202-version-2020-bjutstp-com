document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFilters();
    applyQuerySearch();
});

function setupMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.mobile-nav');

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isOpen));
        menu.hidden = isOpen;
        toggle.textContent = isOpen ? '☰' : '×';
    });
}

function setupHeroSlider() {
    const slider = document.querySelector('.hero-slider');

    if (!slider) {
        return;
    }

    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    const prev = slider.querySelector('.hero-control--prev');
    const next = slider.querySelector('.hero-control--next');
    let index = 0;
    let timer = null;

    const show = (target) => {
        index = (target + slides.length) % slides.length;
        slides.forEach((slide, current) => {
            slide.classList.toggle('is-active', current === index);
        });
        dots.forEach((dot, current) => {
            dot.classList.toggle('is-active', current === index);
        });
    };

    const restart = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            show(Number(dot.dataset.target || 0));
            restart();
        });
    });

    if (prev) {
        prev.addEventListener('click', () => {
            show(index - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            show(index + 1);
            restart();
        });
    }

    restart();
}

function setupCardFilters() {
    const lists = Array.from(document.querySelectorAll('.js-card-list'));

    if (!lists.length) {
        return;
    }

    const searchInput = document.querySelector('.js-card-search');
    const filterChips = Array.from(document.querySelectorAll('.filter-chip'));
    let activeFilter = 'all';

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const cardMatches = (card, query) => {
        const haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.category,
            card.textContent
        ].map(normalize).join(' ');
        const filterMatches = activeFilter === 'all' || normalize(card.dataset.category) === normalize(activeFilter);
        const queryMatches = !query || haystack.includes(query);
        return filterMatches && queryMatches;
    };

    const update = () => {
        const query = normalize(searchInput ? searchInput.value : '');
        let visibleCount = 0;
        lists.forEach((list) => {
            const cards = Array.from(list.querySelectorAll('.movie-card'));
            cards.forEach((card) => {
                const visible = cardMatches(card, query);
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });
        });
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.hidden = visibleCount > 0;
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', update);
    }

    filterChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            filterChips.forEach((item) => item.classList.remove('is-active'));
            chip.classList.add('is-active');
            activeFilter = chip.dataset.filter || 'all';
            update();
        });
    });

    update();
}

function applyQuerySearch() {
    const searchInput = document.querySelector('.js-card-search');

    if (!searchInput) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query) {
        searchInput.value = query;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
