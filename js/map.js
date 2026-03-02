/* ============================================================
   TopScuole.it — Search Logic (schools.html)
   Nessuna mappa qui — solo lista card con link Google Maps.
   Dataset: window.MIUR_DATA (schools-data.js, 4000+ scuole)
   ============================================================ */

(function () {
  'use strict';

  var SCHOOLS_DATA = [];
  var filtered = [];
  var currentPage = 0;
  var PAGE_SIZE = 24;

  /* ---- Levenshtein fuzzy search ---- */
  function levenshtein(a, b) {
    var m = a.length, n = b.length, dp = [], i, j;
    for (i = 0; i <= m; i++) { dp[i] = [i]; }
    for (j = 0; j <= n; j++) { dp[0][j] = j; }
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
    return dp[m][n];
  }

  function fuzzySearch(query) {
    var q = query.toLowerCase().trim();
    if (!q || q.length < 2) return [];
    return SCHOOLS_DATA
      .map(function (s) {
        var fields = [s.nome.toLowerCase(), s.comune.toLowerCase(), s.tipo.toLowerCase()];
        var minDist = 99;
        fields.forEach(function (f) {
          if (f.indexOf(q) !== -1) { minDist = -1; return; }
          f.split(/\s+/).forEach(function (fw) {
            q.split(/\s+/).forEach(function (qw) {
              if (fw.length > 2 && qw.length > 2) minDist = Math.min(minDist, levenshtein(fw, qw));
            });
          });
        });
        return { s: s, d: minDist };
      })
      .filter(function (x) { return x.d >= 0 && x.d <= 2; })
      .sort(function (a, b) { return a.d - b.d; })
      .slice(0, 6)
      .map(function (x) { return x.s; });
  }

  function escHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function debounce(fn, ms) {
    var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  function googleMapsUrl(school) {
    var q = encodeURIComponent([school.indirizzo, school.comune, 'Italia'].filter(Boolean).join(', '));
    return 'https://www.google.com/maps/search/?api=1&query=' + q;
  }

  /* ---- Legge recensioni per questa scuola ---- */
  function getReviewCount(schoolId) {
    try {
      var raw = localStorage.getItem('tsrev_' + schoolId);
      return raw ? JSON.parse(raw).length : 0;
    } catch (e) { return 0; }
  }

  function getSchoolScore(schoolId) {
    try {
      var raw = localStorage.getItem('tsrev_' + schoolId);
      if (!raw) return null;
      var revs = JSON.parse(raw);
      if (!revs.length) return null;
      var total = revs.reduce(function (s, r) {
        return s + ((r.scores.didattica + r.scores.struttura + r.scores.ambiente + r.scores.org + r.scores.servizi) / 5);
      }, 0);
      return Math.round((total / revs.length) * 10) / 10;
    } catch (e) { return null; }
  }

  /* ---- Card scuola (top: badge+nome | bottom: rating + bottoni) ---- */
  function renderCard(school) {
    var score = school.score !== null ? school.score : getSchoolScore(school.id);
    var revCount = school.recensioni || getReviewCount(school.id);
    var hasScore = score !== null;
    var stars = hasScore ? [1, 2, 3, 4, 5].map(function (i) {
      return '<span style="color:' + (i <= Math.round(score) ? '#F4C430' : '#dee2e6') + '">★</span>';
    }).join('') : '';

    var ratingHtml = hasScore
      ? '<span class="card-score-inline">' + score + '</span>'
      + '<span class="card-stars-inline">' + stars + '</span>'
      + '<span class="card-revcount-inline">' + revCount + (revCount === 1 ? ' recensione' : ' recensioni') + '</span>'
      : '<span class="card-revcount-inline">Nessuna recensione</span>';

    return '<a href="school-detail.html?id=' + encodeURIComponent(school.id) + '" class="school-card">'
      /* riga top: badge + info */
      + '<div class="school-card__top">'
      + '<div class="school-initials">' + escHtml(school.initials || 'SC') + '</div>'
      + '<div class="school-card__info">'
      + '<div class="school-card__name" title="' + escHtml(school.nome) + '">' + escHtml(school.nome) + '</div>'
      + '<div class="school-card__meta">'
      + '<span class="school-card__type-badge">' + escHtml(school.tipo) + '</span>'
      + '<span class="school-card__location"><i class="fas fa-map-marker-alt"></i> '
      + escHtml(school.comune) + ' (' + escHtml(school.provincia) + ')'
      + (school.regione ? ' &mdash; ' + escHtml(school.regione) : '') + '</span>'
      + '</div>'
      + '</div>'
      + '</div>'
      /* riga bottom: rating + dettagli + mappa */
      + '<div class="school-card__bottom">'
      + '<div class="school-card__rating">' + ratingHtml + '</div>'
      + '<div class="school-card__actions">'
      + '<span class="btn-detail"><i class="fas fa-info-circle"></i> Dettagli</span>'
      + '<a href="' + googleMapsUrl(school) + '" target="_blank" rel="noopener" class="btn-maps" onclick="event.stopPropagation()">'
      + '<i class="fas fa-map-marker-alt"></i> Mappa</a>'
      + '</div>'
      + '</div>'
      + '</a>';
  }

  /* ---- Fuzzy banner ---- */
  function showSuggestionBanner(query, suggestions) {
    var banner = document.getElementById('suggestionBanner');
    if (!banner) return;
    if (!suggestions.length) {
      banner.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--gray-400);">'
        + '<i class="fas fa-search" style="font-size:2rem;margin-bottom:.75rem;display:block;"></i>'
        + '<strong>Nessuna scuola trovata per "' + escHtml(query) + '"</strong><br>'
        + '<span style="font-size:.85rem;margin-top:.5rem;display:block;">Prova con la città, la regione o il tipo di scuola.</span>'
        + '</div>';
      return;
    }
    banner.innerHTML = '<div style="background:#fff;border-radius:12px;padding:1.25rem;'
      + 'border:2px solid var(--gold);box-shadow:0 4px 16px rgba(244,196,48,.15);margin-bottom:.5rem;">'
      + '<p style="font-weight:700;color:var(--navy);margin-bottom:.75rem;">'
      + '<i class="fas fa-spell-check" style="color:var(--gold);margin-right:.35rem;"></i>'
      + 'Nessun risultato per "<em>' + escHtml(query) + '</em>" — Forse cercavi:</p>'
      + suggestions.map(function (s) {
        return '<button onclick="window.applySearch(\'' + s.nome.replace(/'/g, "\\'") + '\')" '
          + 'style="background:var(--gold);color:var(--navy);border:none;border-radius:999px;'
          + 'padding:.4rem 1rem;font-weight:700;font-size:.82rem;cursor:pointer;margin:.2rem;font-family:Inter,sans-serif;">'
          + escHtml(s.nome) + ' — ' + escHtml(s.comune) + '</button>';
      }).join('')
      + '</div>';
  }

  /* ---- Render paginated grid ---- */
  function renderGrid() {
    var grid = document.getElementById('schoolsGrid');
    var banner = document.getElementById('suggestionBanner');
    var btn = document.getElementById('loadMoreBtn');
    if (!grid) return;

    var start = currentPage * PAGE_SIZE;
    var end = Math.min(start + PAGE_SIZE, filtered.length);

    if (currentPage === 0) {
      if (banner) banner.innerHTML = '';
      grid.innerHTML = '';
    } else {
      // Remove old load-more if present
      if (btn) btn.style.display = 'none';
    }

    for (var i = start; i < end; i++) {
      grid.insertAdjacentHTML('beforeend', renderCard(filtered[i]));
    }

    if (btn) {
      if (end < filtered.length) {
        var rem = filtered.length - end;
        btn.style.display = 'block';
        btn.textContent = 'Carica altri ' + Math.min(rem, PAGE_SIZE) + ' di ' + rem.toLocaleString('it') + ' scuole';
      } else {
        btn.style.display = 'none';
      }
    }
  }

  /* ---- Main filter function ---- */
  function filterSchools() {
    if (!SCHOOLS_DATA.length) return;

    var query = (document.getElementById('searchInput') ? document.getElementById('searchInput').value : '').trim();
    var qLow = query.toLowerCase();
    var type = document.getElementById('typeFilter') ? document.getElementById('typeFilter').value : '';
    var regione = document.getElementById('regionFilter') ? document.getElementById('regionFilter').value : '';
    var minRat = parseFloat(document.getElementById('ratingFilter') ? document.getElementById('ratingFilter').value : '0') || 0;

    filtered = SCHOOLS_DATA.filter(function (s) {
      var matchQ = !qLow || [s.nome, s.comune, s.tipo, s.provincia, s.id, s.cap, s.regione || '', s.indirizzo]
        .some(function (f) { return (f || '').toLowerCase().indexOf(qLow) !== -1; });
      var matchT = !type || s.tipo.toLowerCase().indexOf(type.toLowerCase()) !== -1;
      var matchR = !regione || (s.regione || '').toLowerCase().indexOf(regione.toLowerCase()) !== -1;
      var matchV = !minRat || (s.score !== null && s.score >= minRat);
      return matchQ && matchT && matchR && matchV;
    });

    currentPage = 0;

    var countEl = document.getElementById('resultsCount');
    if (countEl) {
      var total = SCHOOLS_DATA.length.toLocaleString('it');
      var n = filtered.length;
      countEl.textContent = n.toLocaleString('it')
        + (n === 1 ? ' scuola trovata' : ' scuole trovate')
        + (n < SCHOOLS_DATA.length ? ' su ' + total : '');
    }

    if (!filtered.length) {
      var grid = document.getElementById('schoolsGrid');
      if (grid) grid.innerHTML = '';
      showSuggestionBanner(query, fuzzySearch(qLow));
      var btn = document.getElementById('loadMoreBtn');
      if (btn) btn.style.display = 'none';
      return;
    }

    renderGrid();
  }

  /* ---- Populate region filter ---- */
  function buildRegionFilter() {
    var sel = document.getElementById('regionFilter');
    if (!sel) return;
    var regions = {};
    SCHOOLS_DATA.forEach(function (s) { if (s.regione) regions[s.regione] = true; });
    Object.keys(regions).sort().forEach(function (r) {
      var opt = document.createElement('option');
      opt.value = r; opt.textContent = r;
      sel.appendChild(opt);
    });
  }

  /* ---- Load more ---- */
  function loadMoreSchools() {
    currentPage++;
    renderGrid();
  }

  function applySearch(value) {
    var inp = document.getElementById('searchInput');
    if (inp) { inp.value = value; filterSchools(); }
  }

  /* ---- INIT ---- */
  function init() {
    var si = document.getElementById('searchInput');
    var uq = new URLSearchParams(window.location.search).get('q') || '';
    if (si && uq) si.value = uq;

    function onData(schools) {
      SCHOOLS_DATA = schools;
      var badge = document.getElementById('miurBadge');
      if (badge) badge.innerHTML = '<i class="fas fa-database" style="color:#F4C430"></i> '
        + '<a href="https://dati.istruzione.it/opendata/opendata/catalogo/elements1/?area=Scuole" '
        + 'target="_blank" rel="noopener" style="color:#1A3A5C;font-weight:600;">MIUR Open Data</a>'
        + ' 2025/26 &mdash; <strong>' + SCHOOLS_DATA.length.toLocaleString('it') + '</strong> scuole superiori';

      buildRegionFilter();

      var dFilter = debounce(filterSchools, 200);
      if (si) {
        si.removeAttribute('oninput');
        si.addEventListener('input', dFilter);
      }

      filterSchools();
    }

    if (window.MIUR_DATA && window.MIUR_DATA.length) {
      onData(window.MIUR_DATA);
    } else {
      fetch('data/all-schools-italy.json')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (d) { onData(d.scuole || d); })
        .catch(function (err) {
          var g = document.getElementById('schoolsGrid');
          if (g) g.innerHTML = '<div style="grid-column:1/-1;padding:3rem;text-align:center;color:#dc3545;">'
            + '<i class="fas fa-exclamation-triangle" style="font-size:2rem;display:block;margin-bottom:.5rem;"></i>'
            + '<strong>Errore caricamento dati</strong><br><small>' + err.message + '</small></div>';
        });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.filterSchools = filterSchools;
  window.applySearch = applySearch;
  window.loadMoreSchools = loadMoreSchools;

})();
