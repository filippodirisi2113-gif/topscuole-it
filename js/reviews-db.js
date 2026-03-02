/* ============================================================
   TopScuole.it — Reviews Database (localStorage → Firestore)
   Gestisce le recensioni per tutte le 4.000+ scuole MIUR.
   ============================================================ */

(function () {
    'use strict';

    var DB_PREFIX = 'tsrev_'; // localStorage key prefix

    /* ---------- CRUD ----------------------------------------- */

    /** Legge tutte le recensioni di una scuola (localStorage + seed) */
    function getReviews(schoolId) {
        try {
            var raw = localStorage.getItem(DB_PREFIX + schoolId);
            var userReviews = raw ? JSON.parse(raw) : [];
            // Merge con seed reviews (mostrate solo se non già presenti)
            var seed = (window.SEED_REVIEWS && window.SEED_REVIEWS[schoolId]) || [];
            var userIds = userReviews.map(function (r) { return r.id; });
            var seedNew = seed.filter(function (r) { return userIds.indexOf(r.id) === -1; });
            return userReviews.concat(seedNew);
        } catch (e) { return []; }
    }

    /** Aggiunge una recensione e ricalcola il punteggio medio */
    function addReview(schoolId, review) {
        var reviews = getReviews(schoolId);
        review.id = 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        review.date = new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long' });
        review.helpful = 0;
        review.notHelpful = 0;
        reviews.unshift(review); // newest first
        localStorage.setItem(DB_PREFIX + schoolId, JSON.stringify(reviews));
        return review;
    }

    /** Calcola il punteggio medio da un array di recensioni */
    function calcScore(reviews) {
        if (!reviews.length) return null;
        var total = reviews.reduce(function (sum, r) {
            return sum + ((r.scores.didattica + r.scores.struttura + r.scores.ambiente + r.scores.org + r.scores.servizi) / 5);
        }, 0);
        return Math.round((total / reviews.length) * 10) / 10;
    }

    /** Cancella una recensione per id */
    function deleteReview(schoolId, reviewId) {
        var reviews = getReviews(schoolId).filter(function (r) { return r.id !== reviewId; });
        localStorage.setItem(DB_PREFIX + schoolId, JSON.stringify(reviews));
    }

    /** Incrementa "utile" o "non_utile" */
    function voteHelpful(schoolId, reviewId, type) {
        var reviews = getReviews(schoolId);
        reviews.forEach(function (r) {
            if (r.id === reviewId) {
                if (type === 'yes') r.helpful = (r.helpful || 0) + 1;
                else r.notHelpful = (r.notHelpful || 0) + 1;
            }
        });
        localStorage.setItem(DB_PREFIX + schoolId, JSON.stringify(reviews));
    }

    /* ---------- RENDER --------------------------------------- */

    var ROLE_ICONS = {
        'Studente attuale': '🎒',
        'Ex-alunno': '🎓',
        'Genitore': '👨‍👩‍👧',
        'Docente': '📚',
    };

    function starHtml(val, max) {
        max = max || 5;
        var html = '';
        for (var i = 1; i <= max; i++) {
            html += '<span style="color:' + (i <= Math.round(val) ? '#F4C430' : '#dee2e6') + ';font-size:.75rem">★</span>';
        }
        return html;
    }

    function renderReviewCard(r, schoolId) {
        var initials = (r.userName || 'U').split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
        var avgScore = ((r.scores.didattica + r.scores.struttura + r.scores.ambiente + r.scores.org + r.scores.servizi) / 5).toFixed(1);
        var roleIcon = ROLE_ICONS[r.role] || '👤';

        return '<div class="review-item" data-review-id="' + r.id + '">'
            + '<div class="review-item__top">'
            + '<div class="review-avatar">' + initials + '</div>'
            + '<div class="review-meta">'
            + '<strong>' + escHtml(r.userName || 'Utente anonimo')
            + ' <span style="color:var(--gold);font-size:.8rem">' + starHtml(avgScore) + '</span></strong>'
            + '<small>' + roleIcon + ' ' + escHtml(r.role || '') + ' &middot; ' + escHtml(r.date)
            + (r.verified ? ' <span class="badge badge-gold" style="font-size:.65rem;padding:.12rem .4rem;">Verificato</span>' : '')
            + '</small>'
            + '</div></div>'
            + '<div class="review-scores">'
            + '<span class="review-score-pill">🎓 Didattica: ' + r.scores.didattica + '</span>'
            + '<span class="review-score-pill">🏫 Struttura: ' + r.scores.struttura + '</span>'
            + '<span class="review-score-pill">👥 Ambiente: ' + r.scores.ambiente + '</span>'
            + '<span class="review-score-pill">📋 Org.: ' + r.scores.org + '</span>'
            + '<span class="review-score-pill">🚌 Servizi: ' + r.scores.servizi + '</span>'
            + '</div>'
            + '<div class="review-item__text">' + escHtml(r.text) + '</div>'
            + '<div class="review-item__helpful">'
            + '<span>Quest\'opinione ti è stata utile?</span>'
            + '<button onclick="window.ReviewsDB.vote(\'' + escHtml(schoolId) + '\',\'' + r.id + '\',\'yes\',this)">'
            + '<i class="fas fa-thumbs-up"></i> Sì (<span>' + (r.helpful || 0) + '</span>)</button>'
            + '<button onclick="window.ReviewsDB.vote(\'' + escHtml(schoolId) + '\',\'' + r.id + '\',\'no\',this)">'
            + '<i class="fas fa-thumbs-down"></i> No (<span>' + (r.notHelpful || 0) + '</span>)</button>'
            + '</div></div>';
    }

    /** Renderizza l'intero feed recensioni in un container */
    function renderFeed(schoolId, containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var reviews = getReviews(schoolId);

        if (!reviews.length) {
            container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--gray-400);">'
                + '<i class="fas fa-comment-slash" style="font-size:2rem;margin-bottom:.75rem;display:block;"></i>'
                + '<strong>Ancora nessuna recensione per questa scuola.</strong><br>'
                + '<span style="font-size:.85rem;">Sii il primo a condividere la tua esperienza!</span>'
                + '</div>';
            return;
        }

        var html = reviews.map(function (r) { return renderReviewCard(r, schoolId); }).join('');
        container.innerHTML = html;
        return reviews;
    }

    /** Aggiorna il pannello statistiche (punteggio globale + barre) */
    function renderStats(schoolId) {
        var reviews = getReviews(schoolId);
        var avg = calcScore(reviews);

        // Punteggio globale hero
        var scoreEl = document.getElementById('globalScore');
        var starsEl = document.getElementById('globalStars');
        var countEl = document.getElementById('reviewCount');
        if (scoreEl) scoreEl.textContent = avg !== null ? avg : '—';
        if (starsEl) starsEl.innerHTML = avg !== null ? starHtml(avg, 5) : '☆☆☆☆☆';
        if (countEl) countEl.textContent = reviews.length + ' recension' + (reviews.length === 1 ? 'e' : 'i');

        if (!reviews.length) return;

        // Media per categoria
        var cats = { didattica: 0, struttura: 0, ambiente: 0, org: 0, servizi: 0 };
        reviews.forEach(function (r) {
            Object.keys(cats).forEach(function (k) { cats[k] += r.scores[k] || 0; });
        });
        Object.keys(cats).forEach(function (k) { cats[k] = Math.round((cats[k] / reviews.length) * 10) / 10; });

        // Aggiorna barre
        var catMap = { didattica: 'didattica', struttura: 'struttura', ambiente: 'ambiente', org: 'org', servizi: 'servizi' };
        Object.keys(catMap).forEach(function (k) {
            var fill = document.querySelector('[data-cat-fill="' + k + '"]');
            var val = document.querySelector('[data-cat-val="' + k + '"]');
            if (fill) fill.style.width = (cats[k] / 5 * 100) + '%';
            if (val) val.textContent = cats[k];
        });

        // Radar chart (se Chart.js presente)
        updateRadarChart(cats);
    }

    function updateRadarChart(cats) {
        var canvas = document.getElementById('radarChart');
        if (!canvas || typeof Chart === 'undefined') return;
        if (window._radarChart) window._radarChart.destroy();
        window._radarChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: ['Didattica', 'Struttura', 'Ambiente', 'Organizzazione', 'Servizi'],
                datasets: [{
                    data: [cats.didattica, cats.struttura, cats.ambiente, cats.org, cats.servizi],
                    backgroundColor: 'rgba(244,196,48,.15)',
                    borderColor: '#F4C430', borderWidth: 2, pointBackgroundColor: '#0D1B2A'
                }]
            },
            options: { scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } }
        });
    }

    /* ---------- FORM SUBMISSION ------------------------------ */

    var _ratings = {};

    function initStarRater() {
        document.querySelectorAll('.star-rater__stars').forEach(function (group) {
            var cat = group.dataset.cat;
            _ratings[cat] = 0;
            group.querySelectorAll('.s').forEach(function (star) {
                star.addEventListener('mouseenter', function () {
                    var v = parseInt(star.dataset.val);
                    group.querySelectorAll('.s').forEach(function (s) {
                        s.classList.toggle('active', parseInt(s.dataset.val) <= v);
                    });
                });
                star.addEventListener('mouseleave', function () {
                    var cur = _ratings[cat] || 0;
                    group.querySelectorAll('.s').forEach(function (s) {
                        s.classList.toggle('active', parseInt(s.dataset.val) <= cur);
                    });
                });
                star.addEventListener('click', function () {
                    _ratings[cat] = parseInt(star.dataset.val);
                    group.querySelectorAll('.s').forEach(function (s) {
                        s.classList.toggle('active', parseInt(s.dataset.val) <= _ratings[cat]);
                    });
                });
            });
        });
    }

    function submitReview(schoolId) {
        var role = document.getElementById('roleSelect') ? document.getElementById('roleSelect').value : '';
        var text = document.getElementById('reviewText') ? document.getElementById('reviewText').value.trim() : '';
        var year = document.getElementById('yearInput') ? document.getElementById('yearInput').value : '';

        // Validazione
        if (!role) { showToast('Seleziona il tuo ruolo', 'error'); return; }
        if (text.length < 50) { showToast('La recensione deve avere almeno 50 caratteri', 'error'); return; }
        var cats = ['didattica', 'struttura', 'ambiente', 'org', 'servizi'];
        for (var i = 0; i < cats.length; i++) {
            if (!_ratings[cats[i]]) { showToast('Valuta tutte le categorie', 'error'); return; }
        }

        var user = window._currentUser;
        var review = {
            userName: user ? (user.displayName || user.email.split('@')[0]) : 'Utente anonimo',
            userId: user ? user.uid : null,
            verified: !!user,
            role: role,
            year: year,
            scores: {
                didattica: _ratings.didattica, struttura: _ratings.struttura,
                ambiente: _ratings.ambiente, org: _ratings.org, servizi: _ratings.servizi
            },
            text: text
        };

        addReview(schoolId, review);
        showToast('Recensione pubblicata! Grazie per il tuo contributo 🎉', 'success');

        // Reset form
        document.getElementById('roleSelect').value = '';
        if (document.getElementById('reviewText')) document.getElementById('reviewText').value = '';
        cats.forEach(function (k) { _ratings[k] = 0; });
        document.querySelectorAll('.star-rater__stars .s').forEach(function (s) { s.classList.remove('active'); });

        // Aggiorna feed e stats
        renderFeed(schoolId, 'reviewsFeed');
        renderStats(schoolId);
    }

    function vote(schoolId, reviewId, type, btn) {
        voteHelpful(schoolId, reviewId, type);
        var span = btn.querySelector('span');
        if (span) span.textContent = parseInt(span.textContent) + 1;
        btn.disabled = true;
        btn.style.color = 'var(--gold)';
    }

    /* ---------- TOAST ---------------------------------------- */
    function showToast(msg, type) {
        var t = document.createElement('div');
        t.className = 'toast toast-' + (type || 'info');
        t.textContent = msg;
        t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:' + (type === 'error' ? '#dc3545' : '#28A745')
            + ';color:#fff;padding:.9rem 1.5rem;border-radius:10px;font-size:.9rem;font-weight:600;'
            + 'z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.2);animation:slideIn .3s ease;';
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 3500);
    }

    function escHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ---------- PUBLIC API ----------------------------------- */
    window.ReviewsDB = {
        get: getReviews,
        add: addReview,
        calcScore: calcScore,
        renderFeed: renderFeed,
        renderStats: renderStats,
        submit: submitReview,
        initRater: initStarRater,
        vote: vote
    };

})();
