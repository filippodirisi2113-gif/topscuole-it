/* ============================================================
   TopScuole.it — Search Autocomplete
   Usato in: index.html (cityInput) e schools.html (searchInput)
   ============================================================ */

(function () {
  'use strict';

  var self; // Dichiarata qui per le closure interne

  var AC = {
    maxResults: 8,
    minChars: 2,
    debounceDelay: 180,
    dataLoaded: false,
    dataLoading: false,
    _timer: null,

    /* ---- Init ---- */
    init: function (inputId, opts) {
      var input = document.getElementById(inputId);
      if (!input) return;

      opts = opts || {};
      var self = this;
      var instanceKey = '__ac_' + inputId;

      // Evita doppi init
      if (input[instanceKey]) return;
      input[instanceKey] = true;

      // Crea il container del dropdown
      var wrapper = input.parentElement;
      wrapper.style.position = 'relative';
      wrapper.style.zIndex = '100'; // Evita sovrapposizione da altri elementi (come stats-bar)

      var dropdown = document.createElement('div');
      dropdown.className = 'ac-dropdown';
      dropdown.id = 'ac-dropdown-' + inputId;
      dropdown.setAttribute('role', 'listbox');
      dropdown.setAttribute('aria-label', 'Suggerimenti di ricerca');
      wrapper.appendChild(dropdown);

      // Attributi ARIA sull'input
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-controls', dropdown.id);
      input.setAttribute('aria-expanded', 'false');

      var activeIndex = -1;

      /* ---- Handlers ---- */
      input.addEventListener('input', function () {
        clearTimeout(self._timer);
        self._timer = setTimeout(function () {
          self._handleInput(input, dropdown, opts, function () { activeIndex = -1; });
        }, self.debounceDelay);
      });

      input.addEventListener('keydown', function (e) {
        var items = dropdown.querySelectorAll('.ac-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeIndex = Math.min(activeIndex + 1, items.length - 1);
          self._setActive(items, activeIndex);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeIndex = Math.max(activeIndex - 1, 0);
          self._setActive(items, activeIndex);
        } else if (e.key === 'Enter') {
          if (activeIndex >= 0 && items[activeIndex]) {
            e.preventDefault();
            items[activeIndex].click();
          }
        } else if (e.key === 'Escape') {
          self._closeDropdown(dropdown, input);
          activeIndex = -1;
        }
      });

      // Click fuori → chiudi
      document.addEventListener('click', function (e) {
        if (!wrapper.contains(e.target)) {
          self._closeDropdown(dropdown, input);
          activeIndex = -1;
        }
      });

      // Focus → pre-carica dati (solo se non già presenti)
      input.addEventListener('focus', function () {
        self._ensureData(opts);
      });
    },

    /* ---- Assicura che SCHOOLS_DATA/MIUR_DATA sia disponibile ---- */
    _ensureData: function (opts, callback) {
      var data = window.SCHOOLS_DATA || window.MIUR_DATA;
      // Se il dato è già disponibile globalmente
      if (typeof data !== 'undefined' && data.length) {
        this.dataLoaded = true;
        if (callback) callback();
        return;
      }
      // Se già in loading
      if (this.dataLoading) {
        if (callback) {
          var self = this;
          var checkInterval = setInterval(function () {
            var currentData = window.SCHOOLS_DATA || window.MIUR_DATA;
            if (self.dataLoaded || (typeof currentData !== 'undefined' && currentData.length)) {
              self.dataLoaded = true;
              clearInterval(checkInterval);
              callback();
            }
          }, 100);
        }
        return;
      }
      // Carica dynamicamente il file dati
      this.dataLoading = true;
      var self = this;
      var script = document.createElement('script');
      script.src = (opts.dataPath || 'data/schools-data.js');
      script.onload = function () {
        if (typeof window.SCHOOLS_DATA === 'undefined' && typeof window.MIUR_DATA !== 'undefined') {
          window.SCHOOLS_DATA = window.MIUR_DATA;
        }
        self.dataLoaded = true;
        self.dataLoading = false;
        if (callback) callback();
      };
      script.onerror = function () {
        self.dataLoading = false;
        console.warn('[Autocomplete] Impossibile caricare i dati scuole.');
      };
      document.head.appendChild(script);
    },

    /* ---- Gestisce input e mostra risultati ---- */
    _handleInput: function (input, dropdown, opts, resetActive) {
      var query = input.value.trim();
      if (query.length < this.minChars) {
        this._closeDropdown(dropdown, input);
        return;
      }

      var self = this;
      this._ensureData(opts, function () {
        var results = self._search(query);
        self._renderDropdown(dropdown, input, results, query, opts);
        if (resetActive) resetActive();
      });
    },

    /* ---- Ricerca intelligente ---- */
    _search: function (query) {
      var data = window.SCHOOLS_DATA || window.MIUR_DATA;
      if (!query || typeof data === 'undefined') return [];

      var q = query.toLowerCase().trim();
      var schools = [];
      var cities = {};
      var regions = {};

      data.forEach(function (s) {
        var nome = (s.nome || '').toLowerCase();
        var comune = (s.comune || '').toLowerCase();
        var provincia = (s.provincia || '').toLowerCase();
        var regione = (s.regione || '').toLowerCase();
        var tipo = (s.tipo || '').toLowerCase();
        var cap = (s.cap || '').toLowerCase();
        var id = (s.id || '').toLowerCase();

        // Città
        if (comune.indexOf(q) !== -1 && s.comune && !cities[s.comune]) {
          cities[s.comune] = { label: s.comune, sub: (s.provincia ? s.provincia.toUpperCase() : '') + (s.regione ? ' — ' + self._titleCase(s.regione) : ''), type: 'city', value: s.comune, provincia: s.provincia, regione: s.regione };
        }

        // Regione (solo se query >= 4 chars)
        if (q.length >= 4 && regione.indexOf(q) !== -1 && s.regione && !regions[s.regione]) {
          regions[s.regione] = { label: self._titleCase(s.regione), sub: 'Regione', type: 'region', value: s.regione };
        }

        // Scuola
        var matchNome = nome.indexOf(q) !== -1;
        var matchTipo = tipo.indexOf(q) !== -1 && q.length >= 3;
        var matchCap = cap === q;
        var matchId = id === q;

        if (matchNome || matchCap || matchId || matchTipo) {
          schools.push({
            label: self._titleCase(s.nome),
            sub: self._titleCase(s.tipo) + ' · ' + self._titleCase(s.comune) + (s.provincia ? ' (' + s.provincia.toUpperCase() + ')' : ''),
            type: 'school',
            value: s.nome,
            id: s.id,
            score: s.score || null,
            matchNome: matchNome,
            matchCap: matchCap
          });
        }
      });

      // Ordina scuole: nome che inizia per query viene prima
      schools.sort(function (a, b) {
        var aStarts = a.label.toLowerCase().indexOf(q) === 0;
        var bStarts = b.label.toLowerCase().indexOf(q) === 0;
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        if (b.score && !a.score) return 1;
        if (a.score && !b.score) return -1;
        return a.label.localeCompare(b.label, 'it');
      });

      // Combina: città prima, poi scuole
      var cityArr = Object.values(cities).slice(0, 3);
      var regionArr = Object.values(regions).slice(0, 2);
      var schoolArr = schools.slice(0, this.maxResults - cityArr.length - regionArr.length);

      return cityArr.concat(regionArr).concat(schoolArr).slice(0, this.maxResults);
    },

    /* ---- Render dropdown ---- */
    _renderDropdown: function (dropdown, input, results, query, opts) {
      if (!results.length) {
        this._closeDropdown(dropdown, input);
        return;
      }

      var q = query.toLowerCase();
      var html = '';

      // Aggiungi intestazione gruppi
      var lastType = null;
      results.forEach(function (r) {
        if (r.type !== lastType) {
          if (r.type === 'city' || r.type === 'region') {
            html += '<div class="ac-group-header"><i class="fas fa-map-marker-alt"></i> Luoghi</div>';
          } else if (r.type === 'school') {
            html += '<div class="ac-group-header"><i class="fas fa-graduation-cap"></i> Scuole</div>';
          }
          lastType = r.type;
        }

        var icon = r.type === 'city' ? 'fa-city' : r.type === 'region' ? 'fa-map' : 'fa-school';
        var starsHtml = '';
        if (r.type === 'school' && r.score) {
          starsHtml = '<span class="ac-score">★ ' + r.score.toFixed(1) + '</span>';
        }

        // Bold sull'input corrispondente
        var labelHtml = self._highlight(r.label, q);

        html += '<div class="ac-item" role="option" data-type="' + r.type + '"'
          + (r.id ? ' data-id="' + r.id + '"' : '')
          + (r.value ? ' data-value="' + encodeURIComponent(r.value) + '"' : '')
          + (r.provincia ? ' data-provincia="' + encodeURIComponent(r.provincia) + '"' : '')
          + (r.regione ? ' data-regione="' + encodeURIComponent(r.regione) + '"' : '')
          + '>'
          + '<span class="ac-item__icon"><i class="fas ' + icon + '"></i></span>'
          + '<span class="ac-item__body">'
          + '<span class="ac-item__label">' + labelHtml + '</span>'
          + '<span class="ac-item__sub">' + self._escHtml(r.sub) + '</span>'
          + '</span>'
          + starsHtml
          + '</div>';
      });

      dropdown.innerHTML = html;
      dropdown.classList.add('ac-dropdown--open');
      input.setAttribute('aria-expanded', 'true');

      // Bind click su ogni item
      dropdown.querySelectorAll('.ac-item').forEach(function (item) {
        item.addEventListener('mousedown', function (e) {
          e.preventDefault(); // Evita blur dell'input
        });
        item.addEventListener('click', function () {
          var type = item.dataset.type;
          var value = decodeURIComponent(item.dataset.value || '');
          var id = item.dataset.id || '';
          var provincia = decodeURIComponent(item.dataset.provincia || '');
          var regione = decodeURIComponent(item.dataset.regione || '');

          if (type === 'school' && id) {
            window.location.href = 'school-detail.html?id=' + encodeURIComponent(id);
          } else if (type === 'city') {
            // Se in schools.html, usa il filtro; altrimenti vai alla pagina
            if (typeof window.applySearch === 'function') {
              input.value = value;
              self._closeDropdown(dropdown, input);
              window.applySearch(value);
            } else {
              window.location.href = 'schools.html?q=' + encodeURIComponent(value);
            }
          } else if (type === 'region') {
            window.location.href = 'schools.html?q=' + encodeURIComponent(value);
          } else {
            // Fallback: comportamento di ricerca generico
            input.value = value;
            self._closeDropdown(dropdown, input);
            if (typeof window.filterSchools === 'function') {
              window.filterSchools();
            } else if (typeof window.doSearch === 'function') {
              window.doSearch();
            }
          }
        });

        item.addEventListener('mouseenter', function () {
          var items = dropdown.querySelectorAll('.ac-item');
          items.forEach(function (i) { i.classList.remove('ac-item--active'); });
          item.classList.add('ac-item--active');
        });
      });
    },

    /* ---- Helpers ---- */
    _setActive: function (items, index) {
      items.forEach(function (i) { i.classList.remove('ac-item--active'); });
      if (items[index]) {
        items[index].classList.add('ac-item--active');
        items[index].scrollIntoView({ block: 'nearest' });
      }
    },

    _closeDropdown: function (dropdown, input) {
      dropdown.classList.remove('ac-dropdown--open');
      if (input) input.setAttribute('aria-expanded', 'false');
      setTimeout(function () {
        if (!dropdown.classList.contains('ac-dropdown--open')) {
          dropdown.innerHTML = '';
        }
      }, 200);
    },

    _highlight: function (text, query) {
      var escaped = this._escHtml(text);
      if (!query) return escaped;
      var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return escaped.replace(re, '<mark class="ac-mark">$1</mark>');
    },

    _escHtml: function (str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    _titleCase: function (str) {
      if (!str) return '';
      return str.toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }
  };

  // Inizializza self come riferimento ad AC per le closure
  self = AC;


  /* ---- CSS Styles (iniettato una volta sola) ---- */
  if (!document.getElementById('ac-styles')) {
    var style = document.createElement('style');
    style.id = 'ac-styles';
    style.textContent = `
      .ac-dropdown {
        display: none;
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: #ffffff;
        border-radius: 18px;
        border: 1px solid rgba(13, 27, 42, 0.08); /* Sottile bordo grigio/navy per dare definizione */
        /* Stratificazione di ombreggiature grigie per un effetto 3D morbido e realistico */
        box-shadow: 
          0 30px 60px -15px rgba(13, 27, 42, 0.22), 
          0 15px 30px -10px rgba(13, 27, 42, 0.12), 
          0 0 1px 1px rgba(13, 27, 42, 0.03);
        z-index: 1100;
        overflow: hidden;
        animation: acFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        max-height: 420px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #e9ecef transparent;
        text-align: left; /* Forza allineamento a sinistra */
      }
      .ac-dropdown--open {
        display: block;
      }
      @keyframes acFadeIn {
        from { opacity: 0; transform: translateY(-8px) scale(0.985); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      .ac-group-header {
        padding: 10px 16px 4px;
        font-size: .68rem;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: #9aa5b4;
        display: flex;
        align-items: center;
        gap: 6px;
        text-align: left; /* Forza allineamento a sinistra */
      }
      .ac-group-header:first-child { padding-top: 14px; }
      .ac-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 16px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); /* Transizione Apple-like fluida */
        text-align: left; /* Forza allineamento a sinistra */
      }
      .ac-item:hover,
      .ac-item--active {
        background: rgba(244, 196, 48, 0.08);
        transform: translateX(5px); /* Micro-spostamento dinamico a destra */
      }
      .ac-item__icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(13,27,42,.06);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: .8rem;
        color: #1A3A5C;
      }
      .ac-item--active .ac-item__icon,
      .ac-item:hover .ac-item__icon {
        background: rgba(244,196,48,.2);
        color: #b8860b;
      }
      .ac-item__body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        align-items: flex-start; /* Forza allineamento a sinistra del flex container */
        text-align: left; /* Forza allineamento a sinistra del testo */
      }
      .ac-item__label {
        font-size: .9rem;
        font-weight: 600;
        color: #0D1B2A;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: 'Inter', sans-serif;
      }
      .ac-item__sub {
        font-size: .75rem;
        color: #8898a9;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: 'Inter', sans-serif;
      }
      .ac-mark {
        background: transparent;
        color: inherit;
        font-weight: 800;
        text-decoration: underline;
        text-underline-offset: 2px;
        text-decoration-color: #F4C430;
      }
      .ac-score {
        font-size: .78rem;
        font-weight: 700;
        color: #F4C430;
        white-space: nowrap;
        margin-left: auto;
        font-family: 'Inter', sans-serif;
      }
      .ac-dropdown::-webkit-scrollbar { width: 5px; }
      .ac-dropdown::-webkit-scrollbar-thumb { background: #e9ecef; border-radius: 5px; }

      /* Adatta al search-bar stickied di schools.html */
      .search-bar .ac-dropdown {
        border-radius: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  /* ---- Esporta globalmente ---- */
  window.TopScuoleAutocomplete = AC;

  /* ---- Auto-init all'avvio ---- */
  document.addEventListener('DOMContentLoaded', function () {
    // Index.html: barra hero
    if (document.getElementById('cityInput')) {
      AC.init('cityInput', { dataPath: 'data/schools-data.js' });
    }
    // Schools.html: barra filtri (SCHOOLS_DATA già disponibile)
    if (document.getElementById('searchInput')) {
      AC.init('searchInput');
    }
  });

})();
