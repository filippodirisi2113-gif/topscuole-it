/* ============================================================
   TopScuole.it — Main JavaScript
   ============================================================ */

'use strict';

/* ---- Scroll-reveal (Intersection Observer) ---- */
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initCountUpAnimations();
    initNavbarScroll();
    initSearchHandlers();
    initStarRaters();

    // Animate rating bars on page load
    setTimeout(() => {
        document.querySelectorAll('.rating-bar-fill').forEach(bar => {
            const target = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = target; }, 200);
        });
    }, 300);
});

/* --- Scroll Reveal --- */
function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
}

/* --- Count-Up Animation --- */
function initCountUpAnimations() {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    const formatNumber = (n) => n >= 1000 ? n.toLocaleString('it-IT') + (n >= 1000 ? '+' : '') : n + (n < 200 ? '%' : '+');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const duration = 1800;
            const step = 30;
            const increment = target / (duration / step);
            let current = 0;

            const timer = setInterval(() => {
                current = Math.min(current + increment, target);
                if (target >= 1000) {
                    el.textContent = Math.floor(current).toLocaleString('it-IT') + '+';
                } else if (target <= 110) {
                    el.textContent = Math.floor(current) + '%';
                } else {
                    el.textContent = Math.floor(current) + '+';
                }
                if (current >= target) clearInterval(timer);
            }, step);

            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

/* --- Navbar scroll effect --- */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    }, { passive: true });
}

/* --- Search Handlers (index.html) --- */
function initSearchHandlers() {
    const input = document.getElementById('cityInput');
    if (!input) return;

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch();
    });
}

function setSearch(city) {
    const input = document.getElementById('cityInput');
    if (input) {
        input.value = city;
        input.focus();
    }
}

function doSearch() {
    const input = document.getElementById('cityInput');
    const query = input ? input.value.trim() : '';
    if (!query) {
        input && input.focus();
        return;
    }
    // Animate button
    const btn = document.getElementById('searchBtn');
    if (btn) {
        btn.innerHTML = '<span class="loader" style="width:18px;height:18px;border-width:2px;display:inline-block;"></span> Ricerca...';
        btn.disabled = true;
    }
    // Navigate after brief delay (simulates search)
    setTimeout(() => {
        window.location.href = `schools.html?q=${encodeURIComponent(query)}`;
    }, 600);
}

/* --- Star Raters (school-detail.html) --- */
function initStarRaters() {
    const raterGroups = document.querySelectorAll('.star-rater__stars');
    raterGroups.forEach(group => {
        const stars = group.querySelectorAll('.s');
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.dataset.val);
                stars.forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.val) <= val);
                });
            });
            star.addEventListener('mouseleave', () => {
                const selected = group.dataset.selected;
                stars.forEach(s => {
                    s.classList.toggle('active', selected && parseInt(s.dataset.val) <= parseInt(selected));
                });
            });
            star.addEventListener('click', () => {
                const val = star.dataset.val;
                group.dataset.selected = val;
                stars.forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.val) <= parseInt(val));
                });
            });
        });
    });
}

/* --- Review Submit --- */
function submitReview() {
    const raters = document.querySelectorAll('.star-rater__stars');
    let allRated = true;
    raters.forEach(r => { if (!r.dataset.selected) allRated = false; });

    const text = document.getElementById('reviewText');
    const role = document.getElementById('roleSelect');

    if (!role || !role.value) {
        showToast('Seleziona il tuo ruolo per continuare.', 'warn');
        return;
    }
    if (!allRated) {
        showToast('Compila tutte e 5 le categorie di valutazione.', 'warn');
        return;
    }
    if (!text || text.value.trim().length < 50) {
        showToast('La recensione deve avere almeno 50 caratteri.', 'warn');
        return;
    }

    showToast('Recensione inviata! Sarà pubblicata dopo la moderazione. Grazie! 🎉', 'success');
    text.value = '';
    raters.forEach(r => {
        delete r.dataset.selected;
        r.querySelectorAll('.s').forEach(s => s.classList.remove('active'));
    });
}

/* --- Q&A Submit --- */
function submitQA() {
    const input = document.getElementById('qaInput');
    if (!input || !input.value.trim()) {
        showToast('Scrivi la tua domanda prima di inviare.', 'warn');
        return;
    }
    showToast('Domanda inviata! La community risponderà presto. 💬', 'success');
    input.value = '';
}

/* --- Toast Notification --- */
function showToast(message, type = 'success') {
    const existing = document.querySelector('.ts-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'ts-toast';
    toast.style.cssText = `
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
    background: ${type === 'success' ? '#0D1B2A' : '#F4C430'};
    color: ${type === 'success' ? '#fff' : '#0D1B2A'};
    padding: 0.85rem 1.75rem; border-radius: 999px;
    font-weight: 600; font-size: 0.9rem;
    box-shadow: 0 8px 30px rgba(0,0,0,0.25);
    z-index: 9999; white-space: nowrap;
    animation: fadeInUp 0.3s ease;
    font-family: 'Inter', sans-serif;
  `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

/* --- Helpful vote buttons --- */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.review-item__helpful button');
    if (!btn) return;
    if (btn.dataset.voted) return;
    btn.dataset.voted = '1';
    btn.style.color = 'var(--gold-dark)';
    const match = btn.textContent.match(/\((\d+)\)/);
    if (match) {
        const count = parseInt(match[1]) + 1;
        btn.innerHTML = btn.innerHTML.replace(/\(\d+\)/, `(${count})`);
    }
});
